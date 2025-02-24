import { useState, useEffect } from 'react';
import { socket } from './socket';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import Header from './components/Header';
import { Todo } from './types';
import EmptyState from './components/EmptyState';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Initial fetch of all todos
    fetch('http://localhost:3001/fetchAllTasks')
      .then(response => response.json())
      .then(data => setTodos(data))
      .catch(error => console.error('Error fetching todos:', error));

    // Socket connection setup
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    }

    function onTodosReceived(updatedTodos: Todo[]) {
      setTodos(updatedTodos);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('todos', onTodosReceived);

    // Connect to WebSocket server
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup function
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('todos', onTodosReceived);
    };
  }, []);

  // Add todo handler
  const handleAddTodo = (text: string) => {
    socket.emit('add', text);
  };

  // Toggle todo completion handler
  const handleToggleTodo = (id: string) => {
    socket.emit('toggle', id);
  };

  // Delete todo handler
  const handleDeleteTodo = (id: string) => {
    socket.emit('delete', id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <Header isConnected={isConnected} />
        
        <main className="bg-white rounded-xl shadow-md p-6">
          <TodoInput onAddTodo={handleAddTodo} />
          
          {todos.length > 0 ? (
            <TodoList 
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
