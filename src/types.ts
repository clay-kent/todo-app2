import { z } from 'zod';

export const PRIORITIES = {
    Low: { value: 1, label: 'Low' },
    Medium: { value: 2, label: 'Medium' },
    High: { value: 3, label: 'High' },
} as const;

export type Priority = keyof typeof PRIORITIES;

export const TodoSchema = z.object({
    id: z.string(),
    name: z.string().max(32),
    isDone: z.boolean(),
    priority: z.custom<Priority>((val) => 
        typeof val === 'string' && val in PRIORITIES
    ),
    deadline: z.date().nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;