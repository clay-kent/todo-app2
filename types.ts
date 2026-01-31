import { z } from 'zod';

export const PRIORITIES = {
    Low: { value: 1, label: 'Low' },
    Medium: { value: 2, label: 'Medium' },
    High: { value: 3, label: 'High' },
} as const;

export type Priority = keyof typeof PRIORITIES;

export const STATUSES = {
    pending: { value: 'pending', label: 'Pending' },
    inprogress: { value: 'in_progress', label: 'In Progress' },
    done: { value: 'done', label: 'Done' },
} as const;

export type Status = keyof typeof STATUSES;

export const CATEGORIES = {
    cad: { label: 'CAD', img: '/images/cad.png' },
    map: { label: 'Map', img: '/images/map.png' },
    model: { label: 'Model', img: '/images/model.png' },
} as const;

export type Category = keyof typeof CATEGORIES;

export type Pos = {
    x: number;
    y: number;
};

export const TodoSchema = z.object({
    id: z.string(),
    name: z.string().max(32),
    isDone: z.boolean(),
    priority: z.custom<Priority>((val) => 
        typeof val === 'string' && val in PRIORITIES
    ),
    deadline: z.date().nullable(),
    pos: z.object({
        x: z.number(),
        y: z.number(),
    }).optional(),
    category: z.custom<Category>((val) => 
        typeof val === 'string' && val in CATEGORIES
    ).optional(),
    status: z.string().default('pending'),
    assignees: z.array(z.string()).default([]),
});

export type Todo = z.infer<typeof TodoSchema>;
