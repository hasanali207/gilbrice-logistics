"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type PartnerRole = "OWNER" | "MANAGER" | "WAREHOUSE_EMPLOYEE" | "CASHIER";

const CreatePartnerEmployeePage = () => {
  const router = useRouter();
  const params = useParams();

  const partnerId = params.partnerId as string;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "OWNER" as PartnerRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!form.password) {
      toast.error("Password is required");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/api/v1/employee/${partnerId}/employees`, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: form.role,
      });

      toast.success("Employee created successfully");

      router.push(`/superadmin/partners/${partnerId}/employees`);
    } catch (error: any) {
      console.error("Failed to create employee:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create employee",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* BACK */}

      <button
        onClick={() =>
          router.push(`/superadmin/partners/${partnerId}/employees`)
        }
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Add Partner Employee
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a new employee account for this partner
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* FULL NAME */}

          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>

            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm({
                  ...form,
                  fullName: e.target.value,
                })
              }
              placeholder="Rahim Uddin"
              className="mt-1"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>

            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="rahim@abclogistics.com"
              className="mt-1"
            />
          </div>

          {/* PHONE */}

          <div>
            <label className="text-sm font-medium">Phone</label>

            <Input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              placeholder="01711111111"
              className="mt-1"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>

            <Input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              placeholder="Enter password"
              className="mt-1"
            />

            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          {/* ROLE */}

          <div>
            <label className="text-sm font-medium">Role</label>

            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as PartnerRole,
                })
              }
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            >
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="WAREHOUSE_EMPLOYEE">Warehouse Employee</option>
              <option value="CASHIER">Cashier</option>
            </select>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/superadmin/partners/${partnerId}/employees`)
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Employee"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePartnerEmployeePage;
