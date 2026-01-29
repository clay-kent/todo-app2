'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [deadline, setDeadline] = useState('');
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        setName('');
        setPriority('Low');
        setDeadline('');
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
        body: JSON.stringify({ isDone: !isDone }),
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

      <form onSubmit={handleAdd} className="mb-8 space-y-4">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Todoを入力（32文字以内）"
            maxLength={32}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
            className="border p-2 rounded"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          追加
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="border p-4 rounded flex justify-between items-center">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => handleToggle(todo.id, todo.isDone)}
              />
              <div>
                <span className={todo.isDone ? 'line-through' : ''}>{todo.name}</span>
                <span className="text-sm text-gray-600 ml-2">
                  [{todo.priority}]
                  {todo.deadline && ` ${new Date(todo.deadline).toLocaleString()}`}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
