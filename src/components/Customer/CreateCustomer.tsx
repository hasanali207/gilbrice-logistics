"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";

import { ArrowLeft, UserPlus } from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface IPartner {
  id: string;
  companyName: string;
  slug?: string;
}

export default function CreateCustomer() {
  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  const [partners, setPartners] = useState<IPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    partnerId: "",
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  });

  // Partner employee কিনা
  const isPartnerEmployee =
    user?.role === "OWNER" ||
    user?.role === "MANAGER" ||
    user?.role === "WAREHOUSE_EMPLOYEE" ||
    user?.role === "CASHIER";

  // ============================================
  // FETCH PARTNERS
  // ============================================

  const fetchPartners = async () => {
    setLoadingPartners(true);

    try {
      const res = await api.get("/api/v1/partner");

      setPartners(res.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoadingPartners(false);
    }
  };

  // ============================================
  // INITIALIZE
  // ============================================

  useEffect(() => {
    if (isPartnerEmployee) {
      if (user?.partnerId) {
        setForm((prev) => ({
          ...prev,
          partnerId: user.partnerId!,
        }));
      }

      return;
    }

    fetchPartners();
  }, [isPartnerEmployee, user?.partnerId]);

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.partnerId) {
      toast.error("Please select a partner");
      return;
    }

    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/api/v1/customer/${form.partnerId}`, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      });

      toast.success("Customer created successfully");
    } catch (err: any) {
      console.error("Create customer error:", err);

      toast.error(err?.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // GET PARTNER NAME
  // ============================================

  const selectedPartner = partners.find(
    (partner) => partner.id === form.partnerId,
  );

  // ============================================
  // UI
  // ============================================

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`${basePath}/customers/allcustomers`}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} />
          </Button>
        </Link>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Customer</h2>

          <p className="text-sm text-gray-500 mt-1">
            Create a new customer profile.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserPlus size={20} className="text-blue-600" />
          </div>

          <div>
            <h3 className="font-semibold">Customer Information</h3>

            <p className="text-xs text-gray-500">
              Enter customer contact details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PARTNER */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Partner *
            </label>

            {isPartnerEmployee ? (
              <div className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50">
                {user?.name || user?.name || "Your Partner"}
              </div>
            ) : (
              <select
                className="w-full border rounded-md px-3 py-2 text-sm h-10"
                value={form.partnerId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    partnerId: e.target.value,
                  }))
                }
                disabled={loadingPartners}
              >
                <option value="">
                  {loadingPartners ? "Loading partners..." : "Select Partner"}
                </option>

                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.companyName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* FULL NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name *
            </label>

            <Input
              placeholder="Enter customer name"
              value={form.fullName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Phone
            </label>

            <Input
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </div>

          {/* WHATSAPP */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              WhatsApp
            </label>

            <Input
              placeholder="WhatsApp number"
              value={form.whatsapp}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  whatsapp: e.target.value,
                }))
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>

            <Input
              type="email"
              placeholder="customer@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Address
            </label>

            <Input
              placeholder="Customer address"
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
