const Queue = require("bull");

// Flag untuk mengaktifkan/menonaktifkan queue
const enableQueue = false;

const redisConfig = {
  redis: { 
    host: "172.19.58.12", 
    port: 6379,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    retryStrategy: function(times) {
      // Hanya retry 1 kali dengan delay 1 detik
      if (times > 1) return null; // Tidak retry lagi setelah kali kedua
      return 1000;
    }
  },
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: 'fixed',
      delay: 1000,
    },
  },
};

// Fungsi untuk membuat queue dengan fallback
const createQueue = (name, config) => {
  if (!enableQueue) {
    // Return mock queue object jika queue dinonaktifkan
    return {
      add: async (data) => ({ data }),
      on: () => {},
      getWaitingCount: async () => 0,
      getActiveCount: async () => 0,
      getFailedCount: async () => 0
    };
  }
  
  try {
    return new Queue(name, config);
  } catch (error) {
    console.error(`Error creating ${name} queue:`, error);
    // Return mock queue jika gagal membuat queue asli
    return {
      add: async (data) => ({ data }),
      on: () => {},
      getWaitingCount: async () => 0,
      getActiveCount: async () => 0,
      getFailedCount: async () => 0
    };
  }
};

// Buat queue dengan fallback support
const kategoriQueue = createQueue("kategoriQueue", redisConfig);
const produkQueue = createQueue("produkQueue", redisConfig);

// Error handling untuk queues
if (enableQueue) {
  kategoriQueue.on('error', (error) => {
    console.error('Kategori Queue Error:', error);
  });

  produkQueue.on('error', (error) => {
    console.error('Produk Queue Error:', error);
  });
}

// Log queue status
const logQueueStatus = async (queue, name) => {
  try {
    const [waiting, active, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getFailedCount()
    ]);
    console.log(`${name} Queue Status:`, { waiting, active, failed });
  } catch (error) {
    console.error(`Error getting ${name} queue status:`, error);
  }
};

// Log initial status
logQueueStatus(kategoriQueue, 'Kategori');
logQueueStatus(produkQueue, 'Produk');

module.exports = { kategoriQueue, produkQueue };
