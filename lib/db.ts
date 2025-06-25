import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      };
    }
  }
}

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined.');
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const cached: MongooseCache = (global as unknown as NodeJS.Global).mongoose || { conn: null, promise: null };

if (!(global as unknown as NodeJS.Global).mongoose) {
  (global as unknown as NodeJS.Global).mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using existing database connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new database connection promise...');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully!');
      return mongooseInstance;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      cached.promise = null; // Reset promise on failure to allow retry
      throw error; 
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('Database connection resolved.');
  } catch (e: unknown) {
    cached.promise = null;
    let errorMessage = "Failed to resolve database connection promise.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(errorMessage, e);
    throw e;
  }

  return cached.conn;
}