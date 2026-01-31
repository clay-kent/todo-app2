import React from "react";
import { type Todo, type Category } from "@/types";
import TodoItem3D, { type TodoItemActions } from "@/app/components/TodoItem3D";

type TodoPlacerProps = {
  todos: Todo[];
  selectedCategory: Category;
  actions: TodoItemActions;
};

const TodoPlacer: React.FC<TodoPlacerProps> = ({
  todos,
  selectedCategory,
  actions,
}) => {
  return (
    <>
      {todos
        .filter((t) => t.pos && t.category === selectedCategory)
        .map((todo) => {
          const pos = todo.pos!;
          //TODO: The magic numbers 200 and 400 are used for coordinate transformation without explanation. Consider extracting these as named constants (e.g., COORDINATE_OFFSET = 200, COORDINATE_RANGE = 400) to clarify that this maps a [-200, 200] coordinate space to [0, 100] percentage.
          const left = Math.max(0, Math.min(100, ((pos.x + 200) / 400) * 100));
          const top = Math.max(0, Math.min(100, ((pos.z + 200) / 400) * 100));
          return (
            <div
              key={todo.id}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                position: "absolute",
                transform: "translate(-50%, -50%)",
                zIndex: 5,
              }}
              className="w-max"
              onClick={(e) => {
                e.stopPropagation();
                actions.openModal(todo);
              }}
            >
              <TodoItem3D todo={todo} {...actions} />
            </div>
          );
        })}
    </>
  );
};

export default TodoPlacer;
