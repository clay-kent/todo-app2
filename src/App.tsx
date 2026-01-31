import { useState, useMemo } from "react";
import TodoForm from "./components/NewTodoForm";
import TodoList from "./components/TodoList";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "./components/ui/sidebar";
import { useTodos } from "./hooks/useTodos";
import { type Todo, type Category } from "./types";
import TodoModal from "./components/TodoModal";
import MainDemo from "./components/MainDemo";
import TodoPlacer from "./components/TodoPlacer";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useTodoOperations } from "./hooks/useTodoOperations";
import ToggleSidebarTrigger from "./components/ToggleSidebarTrigger";
import { NavUser } from "./components/NavUser";

const App = () => {
  const { todos, addTodo, removeTodo, updateTodo } = useTodos();
  const [modalData, setModalData] = useState<Todo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("map");
  const onCloseModal = () => setModalData(null);

  const filteredTodos = useMemo(() => {
    if (!selectedCategory) return todos;
    return todos.filter((t) => t.category === selectedCategory);
  }, [todos, selectedCategory]);

  const [currentUserName, setCurrentUserName] = useCurrentUser();
  const operations = useTodoOperations(updateTodo, currentUserName);
  const todoActions = {
    ...operations,
    openModal: setModalData,
    canJoin: (todo: Todo) => !todo.assignees.includes(currentUserName),
  };

  const handleSaveFromModal = (todo: Todo) => {
    const exists = todos.some((t) => t.id === todo.id);
    if (exists) updateTodo(todo);
    else addTodo(todo);
  };

  const handleRemoveFromModal = (id: string) => {
    const exists = todos.some((t) => t.id === id);
    if (exists) removeTodo(id);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <TodoForm onAddTodo={addTodo} category={selectedCategory} />
        </SidebarHeader>
        <SidebarContent>
          <TodoList todos={filteredTodos} actions={todoActions} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser name={currentUserName} onNameChange={setCurrentUserName} />
        </SidebarFooter>
      </Sidebar>
      <main className="relative h-screen overflow-hidden">
        <ToggleSidebarTrigger />
        <MainDemo
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <TodoPlacer
          todos={todos}
          selectedCategory={selectedCategory}
          actions={todoActions}
        />
        {modalData && (
          <TodoModal
            todo={modalData}
            onSave={handleSaveFromModal}
            onRemove={(id) => {
              handleRemoveFromModal(id);
              onCloseModal();
            }}
            onClose={onCloseModal}
          />
        )}
      </main>
    </SidebarProvider>
  );
};

export default App;
