"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_API =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

type CreateStaffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "GILBRICE_ADMIN",
};

export default function CreateStaffModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateStaffModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_API}/staff`,
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          role: form.role,
        },
        {
          headers: {
            Authorization: token || "",
          },
        },
      );

      toast.success("Staff member added successfully");
      onSuccess();
      resetAndClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add staff");
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
          <DialogTitle>Add Staff</DialogTitle>

          <DialogDescription>
            Create a new Gilbrice staff account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="john@gilbrice.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+880 1XXXXXXXXX"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => updateField("role", value)}
            >
              <SelectTrigger id="role">
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
            onClick={resetAndClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            Add Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
