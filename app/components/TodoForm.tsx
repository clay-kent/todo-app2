'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

const PRIORITIES = {
  Low: { value: 1, label: 'Low' },
  Medium: { value: 2, label: 'Medium' },
  High: { value: 3, label: 'High' },
} as const;

type Priority = keyof typeof PRIORITIES;

const TodoFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(32, '名前は32文字以内です'),
  priority: z.custom<Priority>((val) => typeof val === 'string' && val in PRIORITIES),
  deadline: z.date().nullable(),
});

type TodoFormData = z.infer<typeof TodoFormSchema>;

type Props = {
  onAddTodo: (data: Omit<TodoFormData, 'deadline'> & { deadline: Date | null }) => void;
};

const TodoForm: React.FC<Props> = ({ onAddTodo }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: {
      name: '',
      priority: 'Low',
      deadline: null,
    },
  });

  const deadline = watch('deadline');

  const onSubmit = (data: TodoFormData) => {
    onAddTodo(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          placeholder="32文字以内"
          className="w-full border p-2 rounded"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
      </div>

      <div>
        <div className="block text-sm font-medium mb-2">優先度</div>
        <div className="flex gap-4">
          {Object.entries(PRIORITIES).map(([key, config]) => (
            <div key={key}>
              <input
                type="radio"
                id={`priority-${key}`}
                value={key}
                {...register('priority')}
                className="mr-1"
              />
              <label htmlFor={`priority-${key}`}>{config.label}</label>
            </div>
          ))}
        </div>
        {errors.priority && <p style={{ color: 'red' }}>{errors.priority.message}</p>}
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium">
          Deadline
        </label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline ? dayjs(deadline).format('YYYY-MM-DDTHH:mm:ss') : ''}
          onChange={(e) => {
            const value = e.target.value;
            setValue('deadline', value ? new Date(value) : null);
          }}
          className="border p-2 rounded"
        />
        {errors.deadline && <p style={{ color: 'red' }}>{errors.deadline.message}</p>}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Add Todo
      </button>
    </form>
  );
};

export default TodoForm;
