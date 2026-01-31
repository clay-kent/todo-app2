import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { DialogTitle } from "./ui/dialog";

const NewDialog: React.FC<{
  children: React.ReactNode;
  title?: string;
  canClose?: () => boolean;
  onBeforeClose?: () => void;
}> = ({ children, canClose = () => true, onBeforeClose = () => {}, title }) => {
  const handleCloseAttempt = (event: Event) => {
    onBeforeClose();
    if (!canClose()) {
      event.preventDefault();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onBeforeClose();
    }
  };

  return (
    <Dialog modal={false} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus />
          <DialogTitle>{title}</DialogTitle>
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={handleCloseAttempt}
        onEscapeKeyDown={handleCloseAttempt}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default NewDialog;
