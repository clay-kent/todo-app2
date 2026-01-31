import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Category, Priority, Todo } from "../types";
import { PRIORITIES, TodoSchema } from "../types";
import DateField from "./DateField";
import NewDialog from "./NewDialog";
import SelectField from "./SelectField";
import { FieldError } from "./ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";

type Props = {
  onAddTodo: (todo: Todo) => void;
  category: Category;
};

const TodoFormSchema = TodoSchema.omit({ id: true });
type TodoFormData = z.infer<typeof TodoFormSchema>;

const createTodoFormDefaultValues = (category: Category): TodoFormData => ({
  name: "",
  priority: "Low",
  deadline: null,
  description: null,
  assignees: [],
  status: "todo",
  category,
  pos: null,
});

const TodoForm: React.FC<Props> = ({ onAddTodo, category }) => {
  const defaultValues = useMemo(
    () => createTodoFormDefaultValues(category),
    [category],
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<TodoFormData>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues,
  });

  const onSubmit: (data: TodoFormData) => void = (data) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      ...data,
      category,
    };
    onAddTodo(newTodo);
    reset(defaultValues);
  };

  useEffect(() => {
    setValue("category", category);
  }, [category, setValue]);

  const canSubmit = isDirty && isValid;
  const onCloseAttempt = () => !canSubmit;

  return (
    <NewDialog canClose={onCloseAttempt} title="タスクを追加">
      <form id="todo-form" onSubmit={handleSubmit(onSubmit)}>
        <InputGroup aria-invalid={!isValid}>
          <InputGroupInput placeholder="タスク名を入力" {...register("name")} />
          <InputGroupAddon align="block-end" className="flex-wrap">
            <Controller
              name="deadline"
              control={control}
              render={({ field, fieldState }) => (
                <DateField
                  field={field}
                  fieldState={fieldState}
                  id="deadline"
                />
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField<Priority>
                  field={field}
                  options={PRIORITIES}
                  name="priority"
                  fieldState={fieldState}
                  className="w-24 border-0"
                />
              )}
            />
            <InputGroupButton
              type="submit"
              disabled={!canSubmit}
              className="ml-auto px-4"
            >
              保存
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {errors.name?.message && <FieldError>{errors.name.message}</FieldError>}
      </form>
    </NewDialog>
  );
};

export default TodoForm;
