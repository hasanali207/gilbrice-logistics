"use client";

import { Mail, Phone, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Staff } from "./AllStaff";

type ViewStaffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
};

const roleLabels: Record<string, string> = {
  GILBRICE_SUPER_ADMIN: "Super Admin",
  GILBRICE_ADMIN: "Admin",
  GILBRICE_FINANCE: "Finance",
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ViewStaffModal({
  open,
  onOpenChange,
  staff,
}: ViewStaffModalProps) {
  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {staff.fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p>{staff.fullName}</p>

              <p className="text-xs font-normal text-slate-400">
                {roleLabels[staff.role] || staff.role}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
          <InfoRow icon={<Mail size={15} />} label="Email" value={staff.email} />

          <InfoRow
            icon={<Phone size={15} />}
            label="Phone"
            value={staff.phone || "—"}
          />

          <InfoRow
            icon={<ShieldCheck size={15} />}
            label="Status"
            value={staff.status}
          />

          <InfoRow
            icon={<ShieldCheck size={15} />}
            label="Joined"
            value={formatDate(staff.createdAt)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
