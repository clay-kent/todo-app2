import { format } from "date-fns";
import { Calendar, FileText } from "lucide-react";
import React from "react";
import { type Todo, CATEGORIES } from "../types";
import PriorityDisplay from "./PriorityDisplay";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Item, ItemContent, ItemTitle } from "./ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export type TodoItemActions = {
  startWork: (todo: Todo) => void;
  joinWork: (todo: Todo) => void;
  handleCompleteTodo: (todo: Todo) => void;
  openModal: (todo: Todo) => void;
  canJoin: (todo: Todo) => boolean;
};

type Props = {
  todo: Todo;
} & TodoItemActions;

const TodoItem: React.FC<Props> = ({
  todo,
  canJoin,
  startWork,
  joinWork,
  handleCompleteTodo,
  openModal,
}) => {
  const isOverdue =
    todo.deadline && todo.status !== "done" && new Date() > todo.deadline;

  const actionButtons = canJoin(todo) ? (
    <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 gap-2 opacity-0 transition-opacity group-hover/todo:pointer-events-auto group-hover/todo:opacity-100">
      {todo.status === "todo" && (
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            startWork(todo);
          }}
        >
          開始
        </Button>
      )}
      {todo.status === "inprogress" && (
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            joinWork(todo);
          }}
        >
          参加
        </Button>
      )}
    </div>
  ) : null;

  return (
    <Item
      tabIndex={0}
      onClick={() => openModal(todo)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openModal(todo);
      }}
      key={todo.id}
      variant="outline"
      size="sm"
      className="group/todo bg-background gap-1"
    >
      <ItemContent className="relative">
        <div className="flex gap-2">
          <Checkbox
            checked={todo.status === "done"}
            onCheckedChange={(val) => {
              // val is boolean; if checked, complete
              if (val) handleCompleteTodo(todo);
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full"
            title="完了"
          />
          <ItemTitle>{todo.name}</ItemTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {todo.description ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <FileText size={12} className="" />
              </TooltipTrigger>
              <TooltipContent>詳細説明があります</TooltipContent>
            </Tooltip>
          ) : null}
          {todo.deadline ? (
            <Badge variant="outline">
              <Calendar />
              {format(todo.deadline, "yyyy-MM-dd HH:mm")}
              {isOverdue ? <span>{"(Overdue)"}</span> : null}
            </Badge>
          ) : null}
          <Badge variant="outline">
            <PriorityDisplay value={todo.priority} />
          </Badge>
          {todo.category ? (
            <Badge variant="outline">{CATEGORIES[todo.category].label}</Badge>
          ) : null}
          {todo.assignees.length > 0 ? (
            <div className="flex items-center -space-x-1">
              {todo.assignees.slice(0, 3).map((a) => {
                const name = a.trim();
                const initialsFromSegments = name
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((seg) => seg[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const initials =
                  initialsFromSegments || (name[0]?.toUpperCase() ?? "");
                return (
                  <Avatar
                    key={a}
                    className="border-background bg-muted h-5 w-5 border"
                    aria-label={a}
                    title={a}
                  >
                    <AvatarFallback title={a}>{initials || "?"}</AvatarFallback>
                  </Avatar>
                );
              })}
              {todo.assignees.length > 3 ? (
                <Badge variant="outline">+{todo.assignees.length - 3}</Badge>
              ) : null}
            </div>
          ) : null}
        </div>
        {actionButtons}
      </ItemContent>
    </Item>
  );
};

export default TodoItem;
