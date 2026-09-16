"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface DeleteCarrierDialogProps {
  carrier: { id: string; name: string };
  onDeleted: () => void;
}

export default function DeleteCarrierDialog({
  carrier,
  onDeleted,
}: DeleteCarrierDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/api/v1/carrier/${carrier.id}`);
      toast.success("Carrier deleted");
      setOpen(false);
      onDeleted();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete carrier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {carrier.name}?</DialogTitle>
          <DialogDescription>
            This can't be undone. Carriers already attached to shipments can't
            be deleted — deactivate them instead from the edit dialog.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete carrier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
