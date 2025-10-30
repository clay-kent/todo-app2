import type { Todo } from "../types";
import { v4 as uuid } from "uuid";

export const initTodos: Todo[] = [
    {
        id: uuid(),
        name: "Sample Todo 1",
        isDone: false,
        priority: "Medium",
        deadline: new Date("2024-12-31"),
    },
    {
        id: uuid(),
        name: "Sample Todo 2",
        isDone: true,
        priority: "Low",
        deadline: null,
    },
    {
        id: uuid(),
        name: "Sample Todo 3",
        isDone: false,
        priority: "High",
        deadline: new Date("2024-11-30"),
    },
];