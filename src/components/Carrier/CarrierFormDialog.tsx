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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/axios";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Carrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface CarrierFormDialogProps {
  mode: "create" | "edit";
  carrier?: Carrier;
  onSaved: () => void;
}

export default function CarrierFormDialog({
  mode,
  carrier,
  onSaved,
}: CarrierFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(carrier?.name ?? "");
      setCode(carrier?.code ?? "");
      setIsActive(carrier?.isActive ?? true);
    }
  }, [open, carrier]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Carrier name is required");
      return;
    }
    if (!code.trim()) {
      toast.error("Carrier code is required");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        await api.post("/api/v1/carrier", {
          name: name.trim(),
          code: code.trim(),
        });
        toast.success("Carrier created");
      } else if (carrier) {
        await api.patch(`/api/v1/carrier/${carrier.id}`, {
          name: name.trim(),
          code: code.trim(),
          isActive,
        });
        toast.success("Carrier updated");
      }

      setOpen(false);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save carrier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Carrier
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Carrier" : "Edit Carrier"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Register a new carrier for manifest shipments."
              : "Update this carrier's details."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="carrier-name">Carrier name</Label>
            <Input
              id="carrier-name"
              placeholder="DHL Express"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier-code">Carrier code</Label>
            <Input
              id="carrier-code"
              placeholder="DHL"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Short unique code, e.g. DHL, FEDEX, ARAMEX. Auto-uppercased.
            </p>
          </div>

          {mode === "edit" && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="carrier-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive carriers can't be attached to new manifests.
                </p>
              </div>
              <Switch
                id="carrier-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {mode === "create" ? "Create carrier" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
