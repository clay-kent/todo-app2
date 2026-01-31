'use client';

import type { Todo } from '@/types';

export const useTodoOperations = (setTodos: React.Dispatch<React.SetStateAction<Todo[]>>, refetch: () => Promise<void>) => {
  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      if (res.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return { addTodo, updateTodo, deleteTodo };
};
