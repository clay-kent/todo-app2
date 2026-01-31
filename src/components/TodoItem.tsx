import React from "react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { type Todo } from "../types";
import PriorityDisplay from "./PriorityDisplay";

export type TodoItemActions = {
  openModal: (todo: Todo) => void;
  toggleStatus: (id: string) => void;
  removeTodo: (id: string) => void;
};

type TodoItemProps = {
  todo: Todo;
} & TodoItemActions;

const TodoItem: React.FC<TodoItemProps> = ({ todo, toggleStatus }) => {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-card p-2 shadow-md border">
      <Checkbox
        checked={todo.status === "done"}
        onCheckedChange={() => toggleStatus(todo.id)}
      />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{todo.name}</span>
        <div className="flex gap-1 items-center">
          <PriorityDisplay value={todo.priority} />
          <Badge variant="outline" className="text-xs">
            {todo.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
