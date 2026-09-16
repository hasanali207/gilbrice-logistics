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
import api from "@/lib/axios";
import { manifestApi, ShipmentMode } from "@/lib/manifest-api";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  type: string;
  isActive?: boolean;
}

export default function CreateManifestDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ShipmentMode>("AIR");
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);

        const res = await api.get("/api/v1/locations?isActive=true");

        const data = res.data?.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setLocations(list);
      } catch (error: any) {
        console.error("Failed to load locations:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load locations",
        );
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const submit = async () => {
    if (!originId || !destinationId) {
      toast.error("Origin and destination are required");
      return;
    }

    try {
      setLoading(true);
      await manifestApi.create({
        mode,
        originId,
        destinationId,
        ...(departureDate
          ? { departureDate: new Date(departureDate).toISOString() }
          : {}),
      });
      toast.success("Manifest created");
      setOpen(false);
      setOriginId("");
      setDestinationId("");
      setDepartureDate("");
      onCreated();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create manifest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Manifest
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Master Manifest</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label>Shipment Mode</Label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ShipmentMode)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="AIR">AIR</option>
              <option value="SEA">SEA</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Origin */}
            <div className="grid gap-2">
              <Label>Origin</Label>

              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                disabled={loadingLocations}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">
                  {loadingLocations ? "Loading..." : "Select Origin"}
                </option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="grid gap-2">
              <Label>Destination</Label>

              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                disabled={loadingLocations}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">
                  {loadingLocations ? "Loading..." : "Select Destination"}
                </option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>
              Departure Date{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="datetime-local"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>

          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create Manifest"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
