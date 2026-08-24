"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Staff } from "./AllStaff";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

type EditStaffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
  onSuccess: () => void;
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "GILBRICE_ADMIN",
};

export default function EditStaffModal({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: EditStaffModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setForm({
        fullName: staff.fullName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        role: staff.role || "GILBRICE_ADMIN",
      });
    }
  }, [staff]);

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!staff) return;

    if (!form.fullName || !form.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${BASE_API}/staff/${staff.id}`,
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
        },
        {
          headers: {
            Authorization: token || "",
          },
        },
      );

      toast.success("Staff member updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update staff");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !submitting && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit Staff</DialogTitle>

          <DialogDescription>
            Update {staff?.fullName || "this staff member"}&apos;s details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-fullName"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => updateField("role", value)}
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="GILBRICE_SUPER_ADMIN">
                  Super Admin
                </SelectItem>
                <SelectItem value="GILBRICE_ADMIN">Admin</SelectItem>
                <SelectItem value="GILBRICE_FINANCE">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
