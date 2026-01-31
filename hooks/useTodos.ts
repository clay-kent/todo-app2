'use client';

import { useState, useEffect } from 'react';
import type { Todo } from '@/types';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return { todos, setTodos, loading, refetch: fetchTodos };
};
