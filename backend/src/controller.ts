// Update this file at backend/src/controller.ts

import { v4 as uuidv4 } from 'uuid';
import { getRedisClient, getTodoCollection, getRedisKey, isMongoAvailable } from './db';
import { Todo } from './types';

// Max items in Redis before moving to MongoDB
const MAX_REDIS_ITEMS = 50;

// Todo controller
export const todoController = {
  // Add a new todo item
  addTodo: async (text: string): Promise<Todo> => {
    const redis = getRedisClient();
    const redisKey = getRedisKey();

    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: Date.now()
    };

    // Get current todos from Redis
    const currentTodosStr = await redis.get(redisKey);
    let currentTodos: Todo[] = currentTodosStr ? JSON.parse(currentTodosStr) : [];

    // Add new todo
    currentTodos.push(newTodo);

    // Check if we need to move to MongoDB and if MongoDB is available
    if (currentTodos.length > MAX_REDIS_ITEMS && isMongoAvailable()) {
      await todoController.moveToMongo();
      // After moving to MongoDB, only keep the new todo in Redis
      currentTodos = [newTodo];
    }

    // Save updated todos to Redis
    await redis.set(redisKey, JSON.stringify(currentTodos));

    return newTodo;
  },

  // Delete a todo item
  deleteTodo: async (todoId: string): Promise<void> => {
    const redis = getRedisClient();
    const redisKey = getRedisKey();

    // Get current todos from Redis
    const currentTodosStr = await redis.get(redisKey);
    let currentTodos: Todo[] = currentTodosStr ? JSON.parse(currentTodosStr) : [];

    // Find and remove todo
    const todoIndex = currentTodos.findIndex(todo => todo.id === todoId);
    
    if (todoIndex !== -1) {
      currentTodos.splice(todoIndex, 1);
      await redis.set(redisKey, JSON.stringify(currentTodos));
      return;
    }

    // If not found in Redis and MongoDB is available, check MongoDB
    if (isMongoAvailable()) {
      try {
        const mongo = getTodoCollection();
        await mongo.deleteOne({ id: todoId });
      } catch (error) {
        console.error('Error deleting from MongoDB:', error);
      }
    }
  },

  // Toggle todo completion status
  toggleTodo: async (todoId: string): Promise<void> => {
    const redis = getRedisClient();
    const redisKey = getRedisKey();

    // Get current todos from Redis
    const currentTodosStr = await redis.get(redisKey);
    let currentTodos: Todo[] = currentTodosStr ? JSON.parse(currentTodosStr) : [];

    // Find todo in Redis
    const todoIndex = currentTodos.findIndex(todo => todo.id === todoId);
    
    if (todoIndex !== -1) {
      // Toggle completed status
      currentTodos[todoIndex].completed = !currentTodos[todoIndex].completed;
      await redis.set(redisKey, JSON.stringify(currentTodos));
      return;
    }

    // If not found in Redis and MongoDB is available, check MongoDB
    if (isMongoAvailable()) {
      try {
        const mongo = getTodoCollection();
        const todo = await mongo.findOne({ id: todoId });
        
        if (todo) {
          await mongo.updateOne(
            { id: todoId },
            { $set: { completed: !todo.completed } }
          );
        }
      } catch (error) {
        console.error('Error toggling in MongoDB:', error);
      }
    }
  },

  // Get all todos (from both Redis and MongoDB)
  getAllTodos: async (): Promise<Todo[]> => {
    const redis = getRedisClient();
    const redisKey = getRedisKey();

    // Get todos from Redis
    const redisTodosStr = await redis.get(redisKey);
    const redisTodos: Todo[] = redisTodosStr ? JSON.parse(redisTodosStr) : [];

    let mongoTodos: Todo[] = [];
    
    // Get todos from MongoDB if available
    if (isMongoAvailable()) {
      try {
        const mongo = getTodoCollection();
        mongoTodos = (await mongo.find({}).toArray()).map(doc => ({
          id: doc.id,
          text: doc.text,
          completed: doc.completed,
          createdAt: doc.createdAt
        })) as Todo[];
      } catch (error) {
        console.error('Error fetching from MongoDB:', error);
      }
    }

    // Combine and sort by creation date (newest first)
    const allTodos = [...redisTodos, ...mongoTodos];
    return allTodos.sort((a, b) => b.createdAt - a.createdAt);
  },

  // Move todos from Redis to MongoDB
  moveToMongo: async (): Promise<void> => {
    if (!isMongoAvailable()) {
      console.log('MongoDB not available, skipping move operation');
      return;
    }
    
    const redis = getRedisClient();
    const mongo = getTodoCollection();
    const redisKey = getRedisKey();

    // Get todos from Redis
    const redisTodosStr = await redis.get(redisKey);
    const redisTodos: Todo[] = redisTodosStr ? JSON.parse(redisTodosStr) : [];

    if (redisTodos.length > 0) {
      try {
        // Insert todos into MongoDB
        await mongo.insertMany(redisTodos);
        
        // Flush Redis cache
        await redis.del(redisKey);
        
        console.log(`Moved ${redisTodos.length} todos from Redis to MongoDB`);
      } catch (error) {
        console.error('Error moving data to MongoDB:', error);
      }
    }
  }
};