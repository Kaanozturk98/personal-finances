import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ModalProps {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  trigger,
  children,
  disabled = false,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {React.cloneElement(trigger as React.ReactElement, { disabled })}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
