import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent as ADContent,
  AlertDialogHeader as ADHeader,
  AlertDialogTitle as ADTitle,
  AlertDialogDescription as ADDescription,
  AlertDialogFooter as ADFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Props = {
  triggerText?: string;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onOpenChange?: (open: boolean) => void;
};

const DeleteConfirm: React.FC<Props> = ({
  triggerText = "Remove",
  title = "Delete todo?",
  description = "This action cannot be undone.",
  onConfirm,
  onOpenChange,
}) => {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{triggerText}</Button>
      </AlertDialogTrigger>

      <ADContent>
        <ADHeader>
          <ADTitle>{title}</ADTitle>
          <ADDescription>{description}</ADDescription>
        </ADHeader>
        <ADFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
            }}
          >
            Continue
          </AlertDialogAction>
        </ADFooter>
      </ADContent>
    </AlertDialog>
  );
};

export default DeleteConfirm;
