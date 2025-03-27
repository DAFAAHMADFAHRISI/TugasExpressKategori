const Queue = require("bull");

const redisConfig = {
  redis: { 
    host: "10.251.136.250", 
    port: 6379,
    maxRetriesPerRequest: 3,
    retryStrategy: function(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
};

const kategoriQueue = new Queue("kategoriQueue", redisConfig);
const produkQueue = new Queue("produkQueue", redisConfig);

// Error handling for queues
kategoriQueue.on('error', (error) => {
  console.error('Kategori Queue Error:', error);
});

produkQueue.on('error', (error) => {
  console.error('Produk Queue Error:', error);
});

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
