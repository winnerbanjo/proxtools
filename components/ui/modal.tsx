"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-lg shadow-xl w-full max-w-lg p-0 open:animate-in open:fade-in-0 open:zoom-in-95"
      onClose={handleClose}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
