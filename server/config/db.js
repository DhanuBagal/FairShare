import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      console.log('⚡ MONGO_URI not defined. Spinning up high-performance in-memory MongoDB server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log(`✅ In-memory MongoDB server started at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      // Modern mongoose options
    });

    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Mongo Connection Error: ${error.message}`);
    // If external mongo connection fails, fallback to memory server
    if (!mongoMemoryServer) {
      try {
        console.log('🔄 Attempting fallback to in-memory MongoDB server...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback In-memory MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (fbErr) {
        console.error(`❌ Fallback MongoDB Error: ${fbErr.message}`);
      }
    }
    process.exit(1);
  }
};
