import React from "react";
import { type Todo } from "../types";
import TodoItem, { type TodoItemActions } from "./TodoItem";

type Props = {
  todos: Todo[];
  actions: TodoItemActions;
};

const TodoList: React.FC<Props> = ({ todos, actions }) => {
  if (todos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 px-6 py-10 text-center text-sm text-gray-400">
        No todos available.
      </div>
    );
  }
  return (
    <>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} {...actions} />
      ))}
    </>
  );
};

export default TodoList;
