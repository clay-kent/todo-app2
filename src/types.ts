import { z } from 'zod';

export const PRIORITIES = {
    Low: { value: 1, label: 'Low' },
    Medium: { value: 2, label: 'Medium' },
    High: { value: 3, label: 'High' },
} as const;

export type Priority = keyof typeof PRIORITIES;

export const STATUSES = {
    todo: { value: 'todo', label: 'Todo' },
    inprogress: { value: 'inprogress', label: 'In Progress' },
    done: { value: 'done', label: 'Done' },
} as const;

export type Status = keyof typeof STATUSES;

export const CATEGORIES = {
    map: { value: 'map', label: 'Map', img: '/images/map.png' },
    cad: { value: 'cad', label: 'CAD', img: '/images/cad.png' },
    model: { value: 'model', label: 'Modeling', img: '/images/model.png' },
} as const;

export type Category = keyof typeof CATEGORIES;

export const PosSchema = z.object({
    x: z.number().int(),
    y: z.number().int(),
    z: z.number().int(),
});

export type Pos = z.infer<typeof PosSchema>;

export const TodoSchema = z.object({
    id: z.uuid(),
    name: z.string().max(32),
    description: z.string().max(1024).nullable(),
    assignees: z.array(z.string().min(1)),
    priority: z.custom<Priority>((val) => 
        typeof val === 'string' && val in PRIORITIES
    ),
    status: z.custom<Status>((val) => typeof val === 'string' && val in STATUSES),
    category: z.custom<Category>((val) => typeof val === 'string' && val in CATEGORIES),
    pos: PosSchema.nullable(),
    deadline: z.date().nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;