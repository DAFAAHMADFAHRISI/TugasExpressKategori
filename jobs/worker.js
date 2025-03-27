const Model_Kategori = require('../model/Model_Kategori');
const { kategoriQueue, produkQueue } = require('../config/middleware/queue');
const Model_Produk = require('../model/Model_Produk');

// Worker untuk kategori
kategoriQueue.process(async (job) => {
  const { action, id, data } = job.data;
  console.log(`Menerima antrian kategori... ID: ${id}, Action: ${action}`);

  if (action === 'get') {
    const hasilQuery = await Model_Kategori.getById(id);
    console.log(`Kategori dengan ID ${id} selesai: Data kategori diambil.`);
    return { data: hasilQuery };
  }

  if (action === 'store') {
    await Model_Kategori.store(data);
    return { message: `Kategori berhasil ditambahkan` };
  }

  if (action === 'update') {
    await Model_Kategori.update(id, data);
    return { message: `Kategori dengan ID ${id} berhasil diperbarui` };
  }

  if (action === 'delete') {
    await Model_Kategori.delete(id);
    return { message: `Kategori dengan ID ${id} berhasil dihapus` };
  }
});

// Worker untuk produk
produkQueue.process(async (job) => {
  // Tambahkan logika pemrosesan produk di sini
});

console.log("Worker berjalan dan siap memproses banyak antrian...");
