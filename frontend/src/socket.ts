import { io } from 'socket.io-client';

// Create socket instance
export const socket = io('http://localhost:3001', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
