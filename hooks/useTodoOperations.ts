import { STATUSES, type Todo } from "@/types";

export type TodoOperations = {
  startWork: (todo: Todo) => void;
  joinWork: (todo: Todo) => void;
  handleCompleteTodo: (todo: Todo) => void;
};

export const useTodoOperations = (
  updateTodo: (todo: Todo) => void,
  currentUserName: string
): TodoOperations => {
  const startWork = (todo: Todo) => {
    const assignees = [...todo.assignees];
    if (!assignees.includes(currentUserName)) assignees.push(currentUserName);
    updateTodo({ ...todo, status: STATUSES.doing.value, assignees });
  };

  const joinWork = (todo: Todo) => {
    const assignees = [...todo.assignees];
    if (!assignees.includes(currentUserName)) assignees.push(currentUserName);
    updateTodo({ ...todo, assignees });
  };

  const handleCompleteTodo = (todo: Todo) => {
    updateTodo({ ...todo, status: STATUSES.done.value });
  };

  return { startWork, joinWork, handleCompleteTodo };
};
