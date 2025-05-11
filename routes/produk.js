const express = require('express');
const Model_Produk = require('../model/Model_Produk');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Konfigurasi CORS
router.use(cors({
  origin: ['http://localhost:4001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});


const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')){
        return cb(null, true);
    }
    return cb(new Error('only PDF and image files are allowed'), false);
};

const NodeCache = require('node-cache');
const cache = new NodeCache({stdTTL: 60 });


const limits = { fileSize: 1 * 1024 * 1024 };
const upload = multer({storage: storage, limits, fileFilter})


// const fileFilter = (req, file, cb) => {
//     if (!file.mimettype.startWith('/image/')){
//         return cb(new Error('Only image files are allowed'));
//     }
//     cb(null, true);
// }


router.get('/', async (req, res) => {
    try {
        let rows = await Model_Produk.getAll();
        res.status(200).json({ status: true, message: 'Data Produk', data: rows });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Terjadi kesalahan' });
    }
});

router.get('/', async function(req, res, next ){
    let id = req.params.id;
    let rows = await Model_Produk.getAll();
    return res.status(200).json({
        status: true,
        message: 'Data Produk',
        data: rows
    })
}
)

router.get("/", async (req, res, next) => {
    const cacheKey = "all-products"
    const cacheData = cache.get(cacheKey)
  
    if (cacheData) {
      return res.status(200).json({
        status: true,
        message: "Data Produk (Cache)",
        data: cacheData,
      })
    }
  
    const rows = await Model.produk.getAll()
    cache.set(cacheKey, rows)
  
    return res.status(200).json({
      status: true,
      message: "Data Produk",
      data: rows,
    })
  })

router.post('/store', upload.single('gambar_produk'), async (req, res) => {
    try {
        let { nama_produk, kategori_id } = req.body;
        
        // Tangani kasus ketika tidak ada file yang diunggah
        let data = { 
            nama_produk, 
            gambar_produk: req.file ? req.file.filename : null, 
            kategori_id 
        };
        
        await Model_Produk.store(data);
        res.status(201).json({ status: true, message: 'Data berhasil ditambahkan' });
    } catch (error) {
        console.error('Error saat menyimpan produk:', error);
        res.status(500).json({ status: false, message: error.message });
    }
});

router.patch('/update/:id', upload.single('gambar_produk'), async (req, res) => {
    try {
        let id = req.params.id;
        let { nama_produk, kategori_id } = req.body;
        
        console.log('Update produk ID:', id);
        console.log('Body request:', req.body);
        console.log('File upload:', req.file);
        
        // Dapatkan data produk yang akan diupdate
        let rows = await Model_Produk.getById(id);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ 
                status: false, 
                message: 'Produk tidak ditemukan' 
            });
        }
        
        const oldData = rows[0];
        
        // Tentukan gambar produk
        let gambar_produk = null;
        if (req.file) {
            // Jika ada file baru
            gambar_produk = req.file.filename;
            
            // Hapus file lama jika ada
            if (oldData.gambar_produk) {
                const oldFilePath = path.join(__dirname, '../public/images/', oldData.gambar_produk);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                    console.log('File lama berhasil dihapus:', oldData.gambar_produk);
                }
            }
        } else {
            // Jika tidak ada file baru, gunakan gambar lama
            gambar_produk = oldData.gambar_produk;
        }
        
        // Buat objek data untuk update
        let data = { 
            nama_produk: nama_produk || oldData.nama_produk,
            gambar_produk: gambar_produk,
            kategori_id: kategori_id || oldData.kategori_id
        };
        
        // Update data
        await Model_Produk.update(id, data);
        
        res.status(200).json({ 
            status: true, 
            message: 'Data berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error saat update produk:', error);
        res.status(500).json({ 
            status: false, 
            message: 'Terjadi kesalahan', 
            error: error.message
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        
        // Dapatkan data produk yang akan dihapus
        let rows = await Model_Produk.getById(id);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ 
                status: false, 
                message: 'Produk tidak ditemukan' 
            });
        }
        
        // Hapus file gambar jika ada
        if (rows.length > 0 && rows[0].gambar_produk) {
            const filePath = path.join(__dirname, '../public/images/', rows[0].gambar_produk);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('File gambar berhasil dihapus:', rows[0].gambar_produk);
            }
        }
        
        // Hapus data dari database
        await Model_Produk.delete(id);
        
        res.status(200).json({ 
            status: true, 
            message: 'Data berhasil dihapus' 
        });
    } catch (error) {
        console.error('Error saat hapus produk:', error);
        res.status(500).json({ 
            status: false, 
            message: 'Terjadi kesalahan',
            error: error.message
        });
    }
});

module.exports = router;