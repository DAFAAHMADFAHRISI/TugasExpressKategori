const express = require('express');
const Model_Kategori = require('../model/Model_Kategori');
const router = express.Router();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });
const { kategoriQueue } = require('../config/middleware/queue');
const { encryptData, decryptData } = require('../config/middleware/crypto');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: "Terlalu banyak permintaan. Coba 5 menit lagi.."
});

const cacheMiddleware = (req, res, next) => {
    try {
        const key = req.originalUrl;
        const      cachedResponse = cache.get(key);
        
        if (cachedResponse) {
            return res.json({
                status: true,
                message: "Data Kategori (Cache)",
                data: cachedResponse
            });
        }
        
        res.originalJson = res.json;
        res.json = (body) => {
            try {
                cache.set(key, body.data);
                res.originalJson(body);
            } catch (error) {
                console.error('Cache set error:', error);
                res.originalJson(body);
            }
        };
        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};

// Routes
router.get('/', limiter, async function(req, res, next) {
    try {
        let data;
        try {
            // Coba gunakan queue jika tersedia
            const job = await kategoriQueue.add({ action: 'get' });
            const result = await job.finished();
            if (result && result.data) {
                data = result.data;
            }
        } catch (queueError) {
            console.error('Queue error:', queueError);
            // Fallback ke query langsung jika queue gagal
        }

        // Jika data belum diperoleh dari queue, ambil langsung dari model
        if (!data) {
            data = await Model_Kategori.getAll();
        }

        try {
            // Coba enkripsi data jika memungkinkan
            const encrypt = await encryptData(data);
            const decrypt = await decryptData(encrypt);
            return res.status(200).json({
                status: true,
                message: 'Data Kategori',
                data: encrypt,
                dataasli: decrypt
            });
        } catch (encryptError) {
            console.error('Encryption error:', encryptError);
            // Fallback tanpa enkripsi jika gagal
            return res.status(200).json({
                status: true,
                message: 'Data Kategori (Non-encrypted)',
                data: data
            });
        }
    } catch (error) {
        console.error('Error in kategori route:', error);
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
});

router.post('/store', async (req, res) => {
    try {
        const { nama_kategori } = req.body;
        await Model_Kategori.store({ nama_kategori });
        res.status(201).json({ status: true, message: 'Data kategori berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message  });
    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori } = req.body;
        await Model_Kategori.update(id, { nama_kategori });
        res.status(200).json({ status: true, message: 'Data kategori berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Model_Kategori.delete(id);
        res.status(200).json({ status: true, message: 'Data kategori berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message  });
    }
});

module.exports = router;