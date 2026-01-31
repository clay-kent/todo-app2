import { useEffect, useState } from "react";
import { initTodos } from "@/data/initTodos";
import { type Todo } from "@/types";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [initialized, setInitialized] = useState(false);
  const localStorageKey = "TodoApp";

  // Load
  useEffect(() => {
    try {
      const todoJsonStr = localStorage.getItem(localStorageKey);
      if (todoJsonStr) {
        const storedTodos: Todo[] = JSON.parse(todoJsonStr);
        setTodos(
          storedTodos.map((todo) => ({
            ...todo,
            deadline: todo.deadline ? new Date(todo.deadline) : null,
          })),
        );
      } else {
        setTodos(initTodos);
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  // Save
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    }
  }, [todos, initialized]);

  // Actions
  const addTodo = (newTodo: Todo) => setTodos((prev) => [...prev, newTodo]);

  const removeTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const updateTodo = (updatedTodo: Todo) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
    );

  return { todos, addTodo, removeTodo, updateTodo };
};
