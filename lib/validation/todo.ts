import { z } from 'zod';

export const CreateTodoSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(32, '名前は32文字以内です'),
  priority: z.enum(['Low', 'Medium', 'High']),
  deadline: z.string().datetime().nullable(),
});

export const UpdateTodoSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  isDone: z.boolean().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  deadline: z.string().datetime().nullable(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
