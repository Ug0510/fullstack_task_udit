import { FC } from 'react';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoList: FC<TodoListProps> = ({ todos, onToggleTodo, onDeleteTodo }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-500">Tasks</h2>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggleTodo}
            onDelete={onDeleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
