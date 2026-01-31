import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type Category, type Priority, type Status, type Todo } from '@/types';
import { TodoSchema } from '@/types';
import DateField from './DateField';
import SelectField from './SelectField';
import { PRIORITIES, STATUSES, CATEGORIES } from '@/types';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';

type Props = {
  onClose: () => void;
  onAdd: (todo: Omit<Todo, 'id'>) => void;
  category: Category;
};

const NewTodoSchema = TodoSchema.omit({ id: true });
type NewTodoData = z.infer<typeof NewTodoSchema>;

const NewTodoDialog: React.FC<Props> = ({ onClose, onAdd, category }) => {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
  } = useForm<NewTodoData>({
    resolver: zodResolver(NewTodoSchema),
    defaultValues: {
      name: '',
      priority: 'Low',
      deadline: null,
      description: null,
      assignees: [],
      status: 'todo',
      category,
      pos: null,
    },
  });

  const onSubmit = (data: NewTodoData) => {
    onAdd(data);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しいTodoを追加</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldSet>
            <FieldLabel htmlFor="name">タスク名 *</FieldLabel>
            <Input id="name" {...register('name')} placeholder="タスク名を入力" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </FieldSet>

          <FieldSet>
            <FieldLabel htmlFor="description">説明</FieldLabel>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="説明を入力"
              rows={3}
            />
          </FieldSet>

          <div className="grid grid-cols-2 gap-4">
            <FieldSet>
              <FieldLabel htmlFor="priority">優先度</FieldLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField<Priority>
                    field={field}
                    options={PRIORITIES}
                    name="priority"
                    fieldState={fieldState}
                  />
                )}
              />
            </FieldSet>

            <FieldSet>
              <FieldLabel htmlFor="status">ステータス</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField<Status>
                    field={field}
                    options={STATUSES}
                    name="status"
                    fieldState={fieldState}
                  />
                )}
              />
            </FieldSet>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldSet>
              <FieldLabel htmlFor="category">カテゴリ</FieldLabel>
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField<Category>
                    field={field}
                    options={CATEGORIES}
                    name="category"
                    fieldState={fieldState}
                  />
                )}
              />
            </FieldSet>

            <FieldSet>
              <FieldLabel htmlFor="deadline">締切</FieldLabel>
              <Controller
                name="deadline"
                control={control}
                render={({ field, fieldState }) => (
                  <DateField field={field} fieldState={fieldState} id="deadline" />
                )}
              />
            </FieldSet>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!isValid}>
              追加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTodoDialog;
