import type { Todo } from "../types";

export const initTodos: Todo[] = [
  {
    id: crypto.randomUUID(),
    name: "Welcome to Todo App!",
    priority: "High",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    description: "Explore the 3D task map view",
    assignees: [],
    status: "todo",
    category: "personal",
    pos: { x: 0, y: 0, z: 0 },
  },
  {
    id: crypto.randomUUID(),
    name: "Try adding a new task",
    priority: "Medium",
    deadline: null,
    description: "Click the + button to create a new todo",
    assignees: [],
    status: "todo",
    category: "work",
    pos: { x: 1, y: 0, z: 0 },
  },
  {
    id: crypto.randomUUID(),
    name: "Mark tasks as complete",
    priority: "Low",
    deadline: null,
    description: "Check off completed items",
    assignees: [],
    status: "done",
    category: "other",
    pos: { x: 0, y: 0, z: 1 },
  },
];
