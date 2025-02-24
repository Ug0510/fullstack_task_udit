"use strict";
// Update this file at backend/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const controller_1 = require("./controller");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// Connect to databases and start server
const startServer = async () => {
    try {
        // Connect to Redis
        await (0, db_1.connectToRedis)();
        console.log('Connected to Redis successfully');
        // Try to connect to MongoDB, but continue even if it fails
        try {
            await (0, db_1.connectToMongo)();
        }
        catch (error) {
            console.log('MongoDB connection failed, running in Redis-only mode');
        }
        // Socket.io connection handler
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            // Handle add todo event
            socket.on('add', async (todoItem) => {
                try {
                    await controller_1.todoController.addTodo(todoItem);
                    const todos = await controller_1.todoController.getAllTodos();
                    io.emit('todos', todos);
                }
                catch (error) {
                    console.error('Error adding todo:', error);
                    socket.emit('error', { message: 'Failed to add todo item' });
                }
            });
            // Handle delete todo event
            socket.on('delete', async (todoId) => {
                try {
                    await controller_1.todoController.deleteTodo(todoId);
                    const todos = await controller_1.todoController.getAllTodos();
                    io.emit('todos', todos);
                }
                catch (error) {
                    console.error('Error deleting todo:', error);
                    socket.emit('error', { message: 'Failed to delete todo item' });
                }
            });
            // Handle toggle todo completion event
            socket.on('toggle', async (todoId) => {
                try {
                    await controller_1.todoController.toggleTodo(todoId);
                    const todos = await controller_1.todoController.getAllTodos();
                    io.emit('todos', todos);
                }
                catch (error) {
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
                const todos = await controller_1.todoController.getAllTodos();
                res.json(todos);
            }
            catch (error) {
                console.error('Error fetching todos:', error);
                res.status(500).json({ message: 'Failed to fetch todos' });
            }
        });
        // Start server
        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
