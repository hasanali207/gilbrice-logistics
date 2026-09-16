"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Building2, RefreshCw, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CarrierFormDialog from "./CarrierFormDialog";
import DeleteCarrierDialog from "./DeleteCarrierDialog";

interface Carrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/carrier");
      setCarriers(res?.data?.data ?? res?.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load carriers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Carriers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shipping partners used for manifest tracking (DHL, FedEx, etc).
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <CarrierFormDialog mode="create" onSaved={load} />
          </div>
        </div>

        <div className="rounded-xl border bg-background shadow-sm">
          <div className="border-b p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">All Carriers</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {carriers.length} carriers
              </span>
            </div>
          </div>

          <div className="divide-y">
            {loading && carriers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Loading carriers...
              </div>
            ) : carriers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Truck className="mx-auto mb-3 h-8 w-8 opacity-50" />
                No carriers added yet.
              </div>
            ) : (
              carriers.map((carrier) => (
                <div
                  key={carrier.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {carrier.name}
                        </span>
                        <span className="rounded-full border px-2 py-0.5 text-xs">
                          {carrier.code}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            carrier.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {carrier.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <CarrierFormDialog
                      mode="edit"
                      carrier={carrier}
                      onSaved={load}
                    />
                    <DeleteCarrierDialog carrier={carrier} onDeleted={load} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
