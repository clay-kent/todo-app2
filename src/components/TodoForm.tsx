import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import type { Todo } from '../types';
import { PRIORITIES, TodoSchema } from '../types';

type Props = {
  onAddTodo: (todo: Todo) => void;
};

// フォーム用のスキーマ（idとisDoneを除外）
const TodoFormSchema = TodoSchema.omit({ id: true, isDone: true });
type TodoFormData = z.infer<typeof TodoFormSchema>;

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
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      isDone: false,
      ...data,
    };
    onAddTodo(newTodo);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor='name'>name</label>
        <input 
          id="name" 
          type="text" 
          {...register('name')}
          placeholder='32文字以内' 
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
      </div>

      <div>
        <div>優先度</div>
        {Object.entries(PRIORITIES).map(([key, config]) => (
          <div key={key}>
            <input 
              type="radio" 
              id={`priority-${key}`} 
              value={key} 
              {...register('priority')}
            />
            <label htmlFor={`priority-${key}`}>{config.label}</label>
          </div>
        ))}
        {errors.priority && <p style={{ color: 'red' }}>{errors.priority.message}</p>}
      </div>

      <div>
        <label htmlFor='deadline'>Deadline</label>
        <input 
          id="deadline"
          type="datetime-local"
          value={deadline ? dayjs(deadline).format("YYYY-MM-DDTHH:mm:ss") : ""}
          onChange={(e) => {
            const value = e.target.value;
            setValue('deadline', value ? new Date(value) : null);
          }}
        />
        {errors.deadline && <p style={{ color: 'red' }}>{errors.deadline.message}</p>}
      </div>

      <button type="submit">
        Add Todo
      </button>
    </form>
  );
};

export default TodoForm;
