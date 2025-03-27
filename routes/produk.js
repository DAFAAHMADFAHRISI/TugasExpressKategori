const express = require('express');
const Model_Produk = require('../model/Model_Produk');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

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
        let data = { nama_produk, gambar_produk: req.file.filename, kategori_id };
        await Model_Produk.store(data);
        res.status(201).json({ status: true, message: 'Data berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

router.patch('/update/:id', upload.single('gambar_produk'), async (req, res) => {
    try {
        let id = req.params.id;
        let { nama_produk, kategori_id } = req.body;
        let gambar_produk = req.file ? req.file.filename : null;
        let rows = await Model_Produk.getId(id);
        if (rows.length > 0) {
            let oldFile = rows[0].gambar_produk;
            if (gambar_produk && oldFile) fs.unlinkSync(path.join(__dirname, '../public/images/', oldFile));
        }
        let data = { nama_produk, gambar_produk: gambar_produk || rows[0].gambar_produk, kategori_id };
        await Model_Produk.Update(id, data);
        res.status(200).json({ status: true, message: 'Data berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Terjadi kesalahan' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let rows = await Model_Produk.getId(id);
        if (rows.length > 0) {
            let fileOld = rows[0].gambar_produk;
            if (fileOld) fs.unlinkSync(path.join(__dirname, '../public/images/', fileOld));
        }
        await Model_Produk.Delete(id);
        res.status(201).json({ status: true, message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Terjadi kesalahan' });
    }
});

module.exports = router;