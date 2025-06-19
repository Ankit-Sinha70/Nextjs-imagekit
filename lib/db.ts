import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined.');
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    ('Using existing database connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    ('Creating new database connection promise...');
    const opts = {
      bufferCommands: false,
      // Add more options here if needed, e.g., useNewUrlParser: true, useUnifiedTopology: true
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      ('MongoDB connected successfully!');
      return mongooseInstance;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      cached.promise = null; // Reset promise on failure to allow retry
      throw error; // Re-throw to propagate the error
    });
  }

  try {
    cached.conn = await cached.promise;
    ('Database connection resolved.');
  } catch (e: any) {
    cached.promise = null;
    console.error('Failed to resolve database connection promise:', e);
    throw e;
  }

  return cached.conn;
}

// Removed User Schema definition from here. It is handled in models/Profile.ts if needed.
