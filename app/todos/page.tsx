'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';

export const dynamic = 'force-dynamic';

type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: 'Low' | 'Medium' | 'High';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos);
        setError(null);
      } else {
        setError('Todoの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleAdd = async (formData: { name: string; priority: 'Low' | 'Medium' | 'High'; deadline: Date | null }) => {
    setError(null);

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          priority: formData.priority,
          deadline: formData.deadline ? formData.deadline.toISOString() : null,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        fetchTodos();
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Todoの追加に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleToggle = async (id: string, isDone: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        fetchTodos();
      } else {
        setError('Todoの更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        fetchTodos();
      } else {
        setError('Todoの削除に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Todo App</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ログアウト
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <TodoForm onAddTodo={handleAdd} />
      <TodoList todos={todos} updateIsDone={handleToggle} remove={handleDelete} />
    </div>
  );
}
