'use client';

import React from 'react';
import TodoItemList from './TodoItemList';

type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: 'Low' | 'Medium' | 'High';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const TodoList: React.FC<Props> = ({ todos, updateIsDone, remove }) => {
  if (todos.length === 0) {
    return <div>No todos available.</div>;
  }
  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItemList key={todo.id} todo={todo} updateIsDone={updateIsDone} remove={remove} />
      ))}
    </ul>
  );
};

export default TodoList;
