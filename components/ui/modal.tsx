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
      className="w-full max-w-lg rounded-md border border-slate-950/15 bg-[#f4efe5] p-0 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm open:animate-in open:fade-in-0 open:zoom-in-95"
      onClose={handleClose}
    >
      <div className="flex items-center justify-between border-b border-slate-950/10 p-4">
        <h2 className="font-display text-xl font-black tracking-normal">{title}</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
