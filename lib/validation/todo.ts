import { z } from 'zod';

export const CreateTodoSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(32, '名前は32文字以内です'),
  priority: z.enum(['Low', 'Medium', 'High']),
  deadline: z.string().datetime().nullable(),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  category: z.enum(['personal', 'work', 'other']).optional(),
  assignees: z.array(z.string()).optional(),
  pos: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).nullable().optional(),
});

export const UpdateTodoSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  isDone: z.boolean().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  deadline: z.string().datetime().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  category: z.enum(['personal', 'work', 'other']).optional(),
  assignees: z.array(z.string()).optional(),
  pos: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).nullable().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
