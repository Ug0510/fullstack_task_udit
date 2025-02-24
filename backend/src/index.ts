// Update this file at backend/src/index.ts

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToRedis, connectToMongo } from './db';
import { todoController } from './controller';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to databases and start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectToRedis();
    console.log('Connected to Redis successfully');
    
    // Try to connect to MongoDB, but continue even if it fails
    try {
      await connectToMongo();
    } catch (error) {
      console.log('MongoDB connection failed, running in Redis-only mode');
    }

    // Socket.io connection handler
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle add todo event
      socket.on('add', async (todoItem) => {
        try {
          await todoController.addTodo(todoItem);
          const todos = await todoController.getAllTodos();
          io.emit('todos', todos);
        } catch (error) {
          console.error('Error adding todo:', error);
          socket.emit('error', { message: 'Failed to add todo item' });
        }
      });

      // Handle delete todo event
      socket.on('delete', async (todoId) => {
        try {
          await todoController.deleteTodo(todoId);
          const todos = await todoController.getAllTodos();
          io.emit('todos', todos);
        } catch (error) {
          console.error('Error deleting todo:', error);
          socket.emit('error', { message: 'Failed to delete todo item' });
        }
      });

      // Handle toggle todo completion event
      socket.on('toggle', async (todoId) => {
        try {
          await todoController.toggleTodo(todoId);
          const todos = await todoController.getAllTodos();
          io.emit('todos', todos);
        } catch (error) {
          console.error('Error toggling todo:', error);
          socket.emit('error', { message: 'Failed to toggle todo item' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // HTTP endpoint to fetch all tasks
    app.get('/fetchAllTasks', async (req, res) => {
      try {
        const todos = await todoController.getAllTodos();
        res.json(todos);
      } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Failed to fetch todos' });
      }
    });

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();