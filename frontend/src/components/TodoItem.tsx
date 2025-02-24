import { FC } from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <li className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-1 flex-shrink-0 w-5 h-5 rounded border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.completed && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="#7F56D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {todo.text}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(todo.createdAt)}
          </p>
        </div>
        
        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
          aria-label="Delete task"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.33334 4V2.66667C5.33334 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33334 6.66667 1.33334H9.33334C9.68696 1.33334 10.0261 1.47381 10.10.0261 1.47381 10.2762 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.687 3.33334 13.3333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.66666 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.33334 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
