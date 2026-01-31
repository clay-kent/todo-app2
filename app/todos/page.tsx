'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTodos } from '@/hooks/useTodos';
import { useTodoOperations } from '@/hooks/useTodoOperations';
import MainDemo from '../components/MainDemo';
import TodoPlacer from '../components/TodoPlacer';
import TodoModal from '../components/TodoModal';
import NewTodoDialog from '../components/NewTodoDialog';
import { type Category, type Todo } from '@/types';

export const dynamic = 'force-dynamic';

export default function TodosPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { todos, setTodos, loading: todosLoading, refetch } = useTodos();
  const { addTodo, updateTodo, deleteTodo } = useTodoOperations(setTodos, refetch);
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('personal');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSaveTodo = async (todo: Todo) => {
    await updateTodo(todo.id, todo);
    setSelectedTodo(null);
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
    setSelectedTodo(null);
  };

  const handleToggleStatus = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newStatus = todo.status === 'done' ? 'todo' : 'done';
    await updateTodo(id, { status: newStatus });
  };

  const handleAddTodo = async (todo: Omit<Todo, 'id'>) => {
    await addTodo(todo);
    setIsNewDialogOpen(false);
  };

  if (userLoading || todosLoading) {
    return <div className="flex items-center justify-center h-screen">読み込み中...</div>;
  }

  if (!user) {
    return null;
  }

  const todoActions = {
    openModal: (todo: Todo) => setSelectedTodo(todo),
    toggleStatus: handleToggleStatus,
    removeTodo: handleDeleteTodo,
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white bg-black/50 px-4 py-2 rounded">
          3D Todo Map
        </h1>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ログアウト
        </button>
      </div>

      {/* New Todo Button */}
      <button
        onClick={() => setIsNewDialogOpen(true)}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        + 新しいTodo
      </button>

      {/* 3D Background */}
      <div className="relative h-full w-full">
        <MainDemo
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {/* Todo Placer Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full w-full pointer-events-auto">
            <TodoPlacer
              todos={todos}
              selectedCategory={selectedCategory}
              actions={todoActions}
            />
          </div>
        </div>
      </div>

      {/* Todo Modal */}
      {selectedTodo && (
        <TodoModal
          todo={selectedTodo}
          onSave={handleSaveTodo}
          onClose={() => setSelectedTodo(null)}
          onRemove={handleDeleteTodo}
        />
      )}

      {/* New Todo Dialog */}
      {isNewDialogOpen && (
        <NewTodoDialog
          onClose={() => setIsNewDialogOpen(false)}
          onAdd={handleAddTodo}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
