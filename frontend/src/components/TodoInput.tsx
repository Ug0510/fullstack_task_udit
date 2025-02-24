import { FC, useState, KeyboardEvent } from 'react';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
}

const TodoInput: FC<TodoInputProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAddTodo(text);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="todo-input" className="block text-sm font-medium text-gray-500 mb-2">
        Add a new task
      </label>
      <div className="flex gap-2">
        <input
          id="todo-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your task here..."
          className="flex-1 py-2.5 px-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TodoInput;
