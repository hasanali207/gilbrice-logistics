"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function ProtectedRouteModal({
  isOpen,
  onClose,
  onConfirm,
}: ModalProps) {
  let inputRef = React.useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (inputRef.current) {
      const password = inputRef.current.value;
      onConfirm(password); // validation ফাংশনে পাঠানো
      inputRef.current.value = ""; // confirm করার পর input খালি করা
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-xl">
        <DialogHeader>
          <DialogTitle>পাসওয়ার্ড প্রটেকশন</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Input ref={inputRef} type="password" placeholder="পাসওয়ার্ড লিখুন" />
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={handleConfirm}>যাচাই</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
