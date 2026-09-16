"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { manifestApi } from "@/lib/manifest-api";
import { PackagePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AddPackageDialog({
  manifestId,
  disabled,
  onAdded,
}: {
  manifestId: string;
  disabled?: boolean;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [packageCode, setpackageCode] = useState("");
  const [loading, setLoading] = useState(false);

  const add = async () => {
    console.log("INPUT VALUE:", packageCode);
    console.log("TRIMMED VALUE:", packageCode.trim());
    if (!packageCode.trim()) {
      toast.error("Package ID is required");
      return;
    }

    try {
      setLoading(true);
      await manifestApi.addPackage(manifestId, packageCode.trim());
      toast.success("Package added to manifest");
      setpackageCode("");
      setOpen(false);
      onAdded();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to add package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="gap-2">
          <PackagePlus className="h-4 w-4" /> Add Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Package to Manifest</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Package Code</Label>
            <Input
              value={packageCode}
              onChange={(e) => setpackageCode(e.target.value)}
              placeholder="Paste package Code"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Only a WEIGHED package belonging to a compatible shipment can be
            added.
          </p>
          <Button onClick={add} disabled={loading}>
            {loading ? "Adding..." : "Add Package"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
