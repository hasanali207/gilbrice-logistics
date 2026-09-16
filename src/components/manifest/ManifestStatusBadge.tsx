"use client";

import { Badge } from "@/components/ui/badge";
import { ManifestStatus } from "@/lib/manifest-api";

const config: Record<ManifestStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  FINALIZED: { label: "Finalized", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  DEPARTED: { label: "Departed", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  ARRIVED: { label: "Arrived", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
};

export default function ManifestStatusBadge({ status }: { status: ManifestStatus }) {
  const item = config[status] ?? config.DRAFT;
  return <Badge className={item.className}>{item.label}</Badge>;
}
