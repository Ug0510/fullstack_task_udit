# Todo App - Fullstack Task (Udit)

A full-stack To-Do application built with:
- **Backend**: Node.js with Express, Socket.io, Redis, and MongoDB
- **Frontend**: React with TypeScript, Tailwind CSS

## Project Structure

```
fullstack_task_udit/
├── backend/         # Express.js + Socket.io server
├── frontend/        # React.js application
└── README.md        # This file
```

## Features

- Real-time todo updates with WebSockets
- Add, toggle, and delete todo items
- Data storage in Redis with overflow to MongoDB
- Responsive UI design matching the Figma prototype

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run build
npm start
```

2. In another terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `GET /fetchAllTasks` - Retrieves all todo items

## WebSocket Events

- `add` - Add a new todo (client to server)
- `toggle` - Toggle a todo's completion status (client to server)
- `delete` - Delete a todo (client to server)
- `todos` - Updated list of todos (server to client)

## Database Configuration

The application uses both Redis and MongoDB for data storage:

- Redis stores up to 50 todo items for quick access
- When the Redis cache exceeds 50 items, older items are moved to MongoDB
