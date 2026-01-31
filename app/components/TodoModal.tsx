import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Priority, Status, Todo } from "@/types";
import { PRIORITIES, STATUSES, TodoSchema } from "@/types";
import DateField from "@/app/components/DateField";
import PosField from "@/app/components/PosField";
import SelectField from "@/app/components/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirm from "@/app/components/DeleteConfirm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

type Props = {
  todo: Todo;
  onSave: (todo: Todo) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
};
const EditTodoSchema = TodoSchema.omit({ id: true });
type EditTodoData = z.infer<typeof EditTodoSchema>;

const TodoModal: React.FC<Props> = ({ todo, onSave, onClose, onRemove }) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<EditTodoData>({
    resolver: zodResolver(EditTodoSchema),
    defaultValues: todo,
  });

  useEffect(() => {
    reset(todo);
  }, [todo, reset]);

  const save = handleSubmit((data) => {
    onSave({ ...todo, ...data });
    onClose();
  });

  return (
    <Dialog open={!!todo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogDescription>
            Update the task properties below.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input {...register("name")} />
          </Field>
          <Field orientation="vertical">
            <FieldLabel>Description</FieldLabel>
            <Textarea {...register("description")} rows={4} />
            <FieldError errors={[errors.description]} />
          </Field>
          <Field orientation="vertical">
            <FieldLabel>Assignees (one name per line)</FieldLabel>
            <Controller
              name="assignees"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Textarea
                    value={(field.value ?? []).join("\n")}
                    placeholder="Bob\nAlice"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : [],
                      )
                    }
                  />
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
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
          </Field>

          <Field>
            <FieldLabel>Priority</FieldLabel>
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
          </Field>

          <Field>
            <FieldLabel>Deadline</FieldLabel>
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
          </Field>

          <FieldSet>
            <FieldLegend>Position</FieldLegend>
            <Controller
              name="pos"
              control={control}
              render={({ field }) => <PosField field={field} />}
            />
          </FieldSet>
        </form>
        <DialogFooter>
          <DeleteConfirm
            onConfirm={() => {
              onRemove(todo.id);
              onClose();
            }}
          />
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={!isDirty || !isValid}
            title={
              !isDirty
                ? "You have no unsaved changes to save."
                : !isValid
                  ? "Please fix validation errors before saving."
                  : undefined
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TodoModal;
