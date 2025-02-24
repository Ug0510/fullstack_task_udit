"use strict";
// Update this file at backend/src/db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMongoAvailable = exports.getRedisKey = exports.getTodoCollection = exports.getRedisClient = exports.connectToMongo = exports.connectToRedis = void 0;
const ioredis_1 = require("ioredis");
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Redis connection
let redisClient;
// MongoDB connection
let mongoClient;
let todoCollection;
// Redis key
const REDIS_KEY = process.env.REDIS_KEY || 'FULLSTACK_TASK_UDIT';
// Connect to Redis
const connectToRedis = async () => {
    try {
        redisClient = new ioredis_1.Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '12675'),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD
        });
        await redisClient.ping();
        console.log('Connected to Redis successfully');
    }
    catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
};
exports.connectToRedis = connectToRedis;
// Connect to MongoDB
const connectToMongo = async () => {
    try {
        // Modified MongoDB connection to handle connection issues gracefully
        const mongoURI = process.env.MONGO_URI || '';
        console.log("Attempting to connect to MongoDB...");
        // Create MongoDB client
        mongoClient = new mongodb_1.MongoClient(mongoURI, {
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
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Continuing with Redis only mode...');
        // Instead of throwing an error, we'll continue with Redis-only mode
        // This allows the app to work even if MongoDB isn't available
    }
};
exports.connectToMongo = connectToMongo;
// Get Redis client
const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
// Get MongoDB collection
const getTodoCollection = () => {
    if (!todoCollection) {
        throw new Error('MongoDB collection not initialized');
    }
    return todoCollection;
};
exports.getTodoCollection = getTodoCollection;
// Get Redis key
const getRedisKey = () => {
    return REDIS_KEY;
};
exports.getRedisKey = getRedisKey;
// Check if MongoDB is available
const isMongoAvailable = () => {
    return !!todoCollection;
};
exports.isMongoAvailable = isMongoAvailable;
