'use client';

import React from 'react';
import { format } from 'date-fns';

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
  todo: Todo;
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const TodoItemList: React.FC<Props> = ({ todo, updateIsDone, remove }) => {
  const key = todo.id;
  const deadline = todo.deadline ? new Date(todo.deadline) : null;
  const isOverdue = deadline && !todo.isDone && new Date() > deadline;

  return (
    <div key={key} style={{ color: isOverdue ? 'red' : 'inherit' }} className="border p-4 rounded flex justify-between items-center">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          id={`todo-${key}`}
          checked={todo.isDone}
          onChange={(e) => updateIsDone(key, e.target.checked)}
        />
        <div>
          <span className={todo.isDone ? 'line-through' : ''}>{todo.name}</span>
          <span className="text-sm text-gray-600 ml-2">
            | Priority: {todo.priority}
            {deadline && (
              <>
                {' | '}Deadline: {format(deadline, 'yyyy-MM-dd HH:mm')}
                {isOverdue && ' (期限切れ)'}
              </>
            )}
          </span>
        </div>
      </div>
      <button
        onClick={() => remove(key)}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Remove
      </button>
    </div>
  );
};

export default TodoItemList;
