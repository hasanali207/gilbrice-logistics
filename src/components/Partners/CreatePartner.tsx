"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
  companyName: "",
  slug: "",
  trackingPrefix: "",
  phone: "",
  email: "",
  address: "",
  logoUrl: "",
  creditLimit: "" as string | number,
  isActive: true,
};

const CreatePartner = () => {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (
      !form.companyName.trim() ||
      !form.slug.trim() ||
      !form.trackingPrefix.trim()
    ) {
      setError("Company name, slug, and tracking prefix are required");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const payload = {
        companyName: form.companyName.trim(),
        slug: form.slug.trim(),
        trackingPrefix: form.trackingPrefix.trim().toUpperCase(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
        isActive: form.isActive,
      };
      await api.post("/api/v1/partner", payload);
      toast.success("Partner created successfully");
      router.push("/partners");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Create failed";
      setError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button
        onClick={() => router.push("/partners")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to partners
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Partner
      </h2>

      <div className="bg-white p-6 rounded-xl shadow">
        {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Company Name *
            </label>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Slug *</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="abc-logistics"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Tracking Prefix *
            </label>
            <Input
              value={form.trackingPrefix}
              onChange={(e) =>
                setForm({
                  ...form,
                  trackingPrefix: e.target.value.toUpperCase(),
                })
              }
              placeholder="ABC"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Credit Limit
            </label>
            <Input
              type="number"
              value={form.creditLimit}
              onChange={(e) =>
                setForm({ ...form, creditLimit: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Address</label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Logo URL</label>
            <Input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-5 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active immediately
        </label>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push("/partners")}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Partner"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePartner;
