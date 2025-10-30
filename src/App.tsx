import { useEffect, useState } from 'react'
import type { Todo } from './types'
import { initTodos } from './data/initTodos'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);
  const localStorageKey = "TodoApp"
  useEffect(() => {
    try {
      const todoJsonStr = localStorage.getItem(localStorageKey);
      if (todoJsonStr) {
        const storedTodos: Todo[] = JSON.parse(todoJsonStr);
        const parsedTodos = storedTodos.map(todo => ({
          ...todo,
          deadline: todo.deadline ? new Date(todo.deadline) : null,
        }));
        setTodos(parsedTodos);
      } else {
        setTodos(initTodos);
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos to localStorage:', error);
      }
    }
  }, [todos, initialized]);

  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return {...todo, isDone: value};
      }
      return todo;
    }
    );
    setTodos(updatedTodos);
  }
  const remove = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
  }

  const addTodo = (newTodo: Todo) => {
    setTodos([...todos, newTodo]);
  };

  return (
  <div>
    <h1>Todo App</h1>
    <TodoList todos={todos} updateIsDone={updateIsDone} remove={remove}/>
    <TodoForm onAddTodo={addTodo} />
  </div>
  )
}

export default App