const express = require('express');
const Model_Kategori = require('../model/Model_Kategori');
const router = express.Router();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });
const { kategoriQueue } = require('../config/middleware/queue');
const { encryptData } = require('../config/middleware/crypto');

/test
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
router.get('/', cacheMiddleware, async function(req, res, next) {
    try {
        const cacheKey = "all-kategori";
        const cacheData = cache.get(cacheKey);

        if (cacheData) {
            return res.status(200).json({
                status: true,
                message: "Data Kategori (Cache)",
                data: cacheData
            });
        }

        let data;
        try {
            const job = await kategoriQueue.add({ action: 'get' });
            const result = await job.finished();
            if (result && result.data) {
                data = result.data;
            }
        } catch (queueError) {
            console.error('Queue error:', queueError);
            // Fallback to direct query if queue fails
            data = await Model_Kategori.getAll();
        }

        if (!data) {
            data = await Model_Kategori.getAll();
        }

        // Encrypt data if needed
        try {
            const encryptedData = await encryptData(data);
            cache.set(cacheKey, encryptedData);
            return res.status(200).json({
                status: true,
                message: 'Data Kategori',
                data: encryptedData
            });
        } catch (encryptError) {
            console.error('Encryption error:', encryptError);
            cache.set(cacheKey, data);
            return res.status(200).json({
                status: true,
                message: 'Data Kategori',
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