import { z } from "zod";

// Priority
export type Priority = "High" | "Medium" | "Low";
export const PRIORITIES: Record<Priority, { label: string; value: number }> = {
  High: { label: "High", value: 3 },
  Medium: { label: "Medium", value: 2 },
  Low: { label: "Low", value: 1 },
};

// Status
export type Status = "todo" | "doing" | "done";
export const STATUSES: Record<Status, { label: string; value: Status }> = {
  todo: { label: "To Do", value: "todo" },
  doing: { label: "Doing", value: "doing" },
  done: { label: "Done", value: "done" },
};

// Category
export type Category = "personal" | "work" | "other";
export const CATEGORIES: Record<
  Category,
  { label: string; img: string }
> = {
  personal: {
    label: "Personal",
    img: "/images/map.png",
  },
  work: {
    label: "Work",
    img: "/images/cad.png",
  },
  other: {
    label: "Other",
    img: "/images/model.png",
  },
};

// Position (for 3D placement)
export type Pos = {
  x: number;
  y: number;
  z: number;
};

// Todo schema
export const TodoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(32),
  priority: z.enum(["High", "Medium", "Low"]),
  deadline: z.date().nullable(),
  description: z.string().nullable(),
  assignees: z.array(z.string()),
  status: z.enum(["todo", "doing", "done"]),
  category: z.enum(["personal", "work", "other"]),
  pos: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;
