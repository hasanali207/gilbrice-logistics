"use client";

import axios from "axios";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PartnerEmployee } from "./AllPartnerEmployees";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

type PartnerEmployeeStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: PartnerEmployee | null;
  onSuccess: () => void;
};

export default function PartnerEmployeeStatusDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: PartnerEmployeeStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);

  if (!employee) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${BASE_API}/partner/${employee.partnerId}/employees/${employee.id}/status`,
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: token || "",
          },
        },
      );

      toast.success("Staff status updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update staff status",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) {
          if (next)
            setNextStatus(
              employee.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            );
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-600" />
            Update Staff Status
          </DialogTitle>

          <DialogDescription>
            Change the account status for {employee.fullName}. Suspending or
            deactivating will revoke their active sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Select value={nextStatus} onValueChange={setNextStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={submitting}
            variant={nextStatus === "ACTIVE" ? "default" : "destructive"}
          >
            {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
