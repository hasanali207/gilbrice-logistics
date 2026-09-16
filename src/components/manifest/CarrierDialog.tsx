"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import { Carrier, manifestApi } from "@/lib/manifest-api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CarrierDialog({
  manifestId,
  currentCarrier,
  currentWaybill,
  disabled,
  onSaved,
}: {
  manifestId: string;
  currentCarrier?: Carrier | null;
  currentWaybill?: string | null;
  disabled?: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [carrierId, setCarrierId] = useState(currentCarrier?.id ?? "");
  const [waybill, setWaybill] = useState(currentWaybill ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCarrierId(currentCarrier?.id ?? "");
    setWaybill(currentWaybill ?? "");
    manifestApi.getCarriers()
      .then(setCarriers)
      .catch((e) => toast.error(e?.response?.data?.message || "Failed to load carriers"));
  }, [open, currentCarrier?.id, currentWaybill]);

  const save = async () => {
    if (!carrierId) {
      toast.error("Select a carrier");
      return;
    }

    try {
      setLoading(true);
      await manifestApi.attachCarrier(manifestId, {
        carrierId,
        ...(waybill.trim() ? { waybillNumber: waybill.trim() } : {}),
      });
      toast.success("Carrier attached");
      setOpen(false);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to attach carrier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="gap-2">
          <Truck className="h-4 w-4" />
          {currentCarrier ? "Carrier / Waybill" : "Attach Carrier"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Carrier & Master Waybill</DialogTitle></DialogHeader>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Carrier</Label>
            <select
              value={carrierId}
              onChange={(e) => setCarrierId(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select carrier</option>
              {carriers.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Master Waybill / DHL Tracking Number</Label>
            <Input value={waybill} onChange={(e) => setWaybill(e.target.value)} placeholder="e.g. 1234567890" />
          </div>
          <p className="text-xs text-muted-foreground">
            This is the master tracking number. Individual package tracking should remain linked to each package/piece.
          </p>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Carrier"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
