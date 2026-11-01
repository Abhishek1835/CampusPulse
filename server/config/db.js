import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_event_platform';
  const useMemory = process.env.USE_MEMORY_DB !== 'false';

  try {
    // First attempt to connect to the configured MONGO_URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (useMemory) {
      console.warn(`[MongoDB] Could not connect to ${uri} (${err.message}). Starting MongoMemoryServer...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[MongoDB] In-memory database started & connected at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[MongoDB] Connection error:', err.message);
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
