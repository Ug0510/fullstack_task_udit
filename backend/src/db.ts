// Update this file at backend/src/db.ts

import { Redis } from 'ioredis';
import { MongoClient, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection
let redisClient: Redis;

// MongoDB connection
let mongoClient: MongoClient;
let todoCollection: Collection;

// Redis key
const REDIS_KEY = process.env.REDIS_KEY || 'FULLSTACK_TASK_UDIT';

// Connect to Redis
export const connectToRedis = async (): Promise<void> => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '12675'),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD
    });

    await redisClient.ping();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

// Connect to MongoDB
export const connectToMongo = async (): Promise<void> => {
  try {
    // Modified MongoDB connection to handle connection issues gracefully
    const mongoURI = process.env.MONGO_URI || '';
    console.log("Attempting to connect to MongoDB...");
    
    // Create MongoDB client
    mongoClient = new MongoClient(mongoURI, {
      // Add options to handle connection issues
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      // Disable DNS SRV record lookup to avoid the ENOTFOUND error
      directConnection: true
    });
    
    await mongoClient.connect();
    console.log('Connected to MongoDB successfully');

    const db = mongoClient.db(process.env.MONGO_DB);
    todoCollection = db.collection(process.env.MONGO_COLLECTION || 'assignment_udit');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing with Redis only mode...');
    
    // Instead of throwing an error, we'll continue with Redis-only mode
    // This allows the app to work even if MongoDB isn't available
  }
};

// Get Redis client
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Get MongoDB collection
export const getTodoCollection = (): Collection => {
  if (!todoCollection) {
    throw new Error('MongoDB collection not initialized');
  }
  return todoCollection;
};

// Get Redis key
export const getRedisKey = (): string => {
  return REDIS_KEY;
};

// Check if MongoDB is available
export const isMongoAvailable = (): boolean => {
  return !!todoCollection;
};