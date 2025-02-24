"use strict";
// Update this file at backend/src/controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoController = void 0;
const uuid_1 = require("uuid");
const db_1 = require("./db");
// Max items in Redis before moving to MongoDB
const MAX_REDIS_ITEMS = 50;
// Todo controller
exports.todoController = {
    // Add a new todo item
    addTodo: async (text) => {
        const redis = (0, db_1.getRedisClient)();
        const redisKey = (0, db_1.getRedisKey)();
        const newTodo = {
            id: (0, uuid_1.v4)(),
            text,
            completed: false,
            createdAt: Date.now()
        };
        // Get current todos from Redis
        const currentTodosStr = await redis.get(redisKey);
        let currentTodos = currentTodosStr ? JSON.parse(currentTodosStr) : [];
        // Add new todo
        currentTodos.push(newTodo);
        // Check if we need to move to MongoDB and if MongoDB is available
        if (currentTodos.length > MAX_REDIS_ITEMS && (0, db_1.isMongoAvailable)()) {
            await exports.todoController.moveToMongo();
            // After moving to MongoDB, only keep the new todo in Redis
            currentTodos = [newTodo];
        }
        // Save updated todos to Redis
        await redis.set(redisKey, JSON.stringify(currentTodos));
        return newTodo;
    },
    // Delete a todo item
    deleteTodo: async (todoId) => {
        const redis = (0, db_1.getRedisClient)();
        const redisKey = (0, db_1.getRedisKey)();
        // Get current todos from Redis
        const currentTodosStr = await redis.get(redisKey);
        let currentTodos = currentTodosStr ? JSON.parse(currentTodosStr) : [];
        // Find and remove todo
        const todoIndex = currentTodos.findIndex(todo => todo.id === todoId);
        if (todoIndex !== -1) {
            currentTodos.splice(todoIndex, 1);
            await redis.set(redisKey, JSON.stringify(currentTodos));
            return;
        }
        // If not found in Redis and MongoDB is available, check MongoDB
        if ((0, db_1.isMongoAvailable)()) {
            try {
                const mongo = (0, db_1.getTodoCollection)();
                await mongo.deleteOne({ id: todoId });
            }
            catch (error) {
                console.error('Error deleting from MongoDB:', error);
            }
        }
    },
    // Toggle todo completion status
    toggleTodo: async (todoId) => {
        const redis = (0, db_1.getRedisClient)();
        const redisKey = (0, db_1.getRedisKey)();
        // Get current todos from Redis
        const currentTodosStr = await redis.get(redisKey);
        let currentTodos = currentTodosStr ? JSON.parse(currentTodosStr) : [];
        // Find todo in Redis
        const todoIndex = currentTodos.findIndex(todo => todo.id === todoId);
        if (todoIndex !== -1) {
            // Toggle completed status
            currentTodos[todoIndex].completed = !currentTodos[todoIndex].completed;
            await redis.set(redisKey, JSON.stringify(currentTodos));
            return;
        }
        // If not found in Redis and MongoDB is available, check MongoDB
        if ((0, db_1.isMongoAvailable)()) {
            try {
                const mongo = (0, db_1.getTodoCollection)();
                const todo = await mongo.findOne({ id: todoId });
                if (todo) {
                    await mongo.updateOne({ id: todoId }, { $set: { completed: !todo.completed } });
                }
            }
            catch (error) {
                console.error('Error toggling in MongoDB:', error);
            }
        }
    },
    // Get all todos (from both Redis and MongoDB)
    getAllTodos: async () => {
        const redis = (0, db_1.getRedisClient)();
        const redisKey = (0, db_1.getRedisKey)();
        // Get todos from Redis
        const redisTodosStr = await redis.get(redisKey);
        const redisTodos = redisTodosStr ? JSON.parse(redisTodosStr) : [];
        let mongoTodos = [];
        // Get todos from MongoDB if available
        if ((0, db_1.isMongoAvailable)()) {
            try {
                const mongo = (0, db_1.getTodoCollection)();
                mongoTodos = (await mongo.find({}).toArray()).map(doc => ({
                    id: doc.id,
                    text: doc.text,
                    completed: doc.completed,
                    createdAt: doc.createdAt
                }));
            }
            catch (error) {
                console.error('Error fetching from MongoDB:', error);
            }
        }
        // Combine and sort by creation date (newest first)
        const allTodos = [...redisTodos, ...mongoTodos];
        return allTodos.sort((a, b) => b.createdAt - a.createdAt);
    },
    // Move todos from Redis to MongoDB
    moveToMongo: async () => {
        if (!(0, db_1.isMongoAvailable)()) {
            console.log('MongoDB not available, skipping move operation');
            return;
        }
        const redis = (0, db_1.getRedisClient)();
        const mongo = (0, db_1.getTodoCollection)();
        const redisKey = (0, db_1.getRedisKey)();
        // Get todos from Redis
        const redisTodosStr = await redis.get(redisKey);
        const redisTodos = redisTodosStr ? JSON.parse(redisTodosStr) : [];
        if (redisTodos.length > 0) {
            try {
                // Insert todos into MongoDB
                await mongo.insertMany(redisTodos);
                // Flush Redis cache
                await redis.del(redisKey);
                console.log(`Moved ${redisTodos.length} todos from Redis to MongoDB`);
            }
            catch (error) {
                console.error('Error moving data to MongoDB:', error);
            }
        }
    }
};
