"use client";

import axios from "axios";
import { KeyRound, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PartnerEmployee } from "./AllPartnerEmployees";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

type ChangeEmployeePasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: PartnerEmployee | null;
};

export default function ChangeEmployeePasswordModal({
  open,
  onOpenChange,
  employee,
}: ChangeEmployeePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!employee) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${BASE_API}/partner/${employee.partnerId}/employees/${employee.id}/password`,
        {
          newPassword,
        },
        {
          headers: {
            Authorization: token || "",
          },
        },
      );

      toast.success("Password changed successfully");
      resetAndClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !submitting && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={20} className="text-blue-600" />
            Change Password
          </DialogTitle>

          <DialogDescription>
            Set a new password for {employee.fullName}. This will sign them out
            of all active sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">
              New Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={resetAndClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            Change Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
