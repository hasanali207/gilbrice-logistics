"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Loader2,
  PackagePlus,
  Ruler,
  Save,
  Scale,
  Truck,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
}

const CreatePackage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);

  const shipmentId =
    typeof params.shipmentId === "string" ? params.shipmentId : "";

  const partnerId = searchParams.get("partnerId") || "";

  const [shipment, setShipment] = useState<Shipment | null>(null);

  const [loadingShipment, setLoadingShipment] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    weightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
  });

  // ============================================================
  // LOAD SHIPMENT
  // ============================================================

  const fetchShipment = async () => {
    if (!shipmentId) return;

    try {
      setLoadingShipment(true);

      /*
       * তোমার shipment details endpoint যদি আলাদা হয়,
       * শুধু এই endpoint change করবে।
       */
      const res = await api.get(`/api/v1/shipment/${shipmentId}`);

      setShipment(res.data.data);
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to load shipment");
    } finally {
      setLoadingShipment(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [shipmentId]);

  // ============================================================
  // CHANGE
  // ============================================================

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // VOLUME
  // ============================================================

  const volume = useMemo(() => {
    const length = Number(form.lengthCm || 0);
    const width = Number(form.widthCm || 0);
    const height = Number(form.heightCm || 0);

    return length * width * height;
  }, [form.lengthCm, form.widthCm, form.heightCm]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipmentId) {
      toast.error("Shipment is required");
      return;
    }

    if (!form.weightKg || Number(form.weightKg) <= 0) {
      toast.error("Enter a valid package weight");
      return;
    }

    if (form.lengthCm && Number(form.lengthCm) <= 0) {
      toast.error("Invalid length");
      return;
    }

    if (form.widthCm && Number(form.widthCm) <= 0) {
      toast.error("Invalid width");
      return;
    }

    if (form.heightCm && Number(form.heightCm) <= 0) {
      toast.error("Invalid height");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        shipmentId,

        ...(partnerId && {
          partnerId,
        }),

        ...(form.description.trim() && {
          description: form.description.trim(),
        }),

        weightKg: Number(form.weightKg),

        ...(form.lengthCm !== "" && {
          lengthCm: Number(form.lengthCm),
        }),

        ...(form.widthCm !== "" && {
          widthCm: Number(form.widthCm),
        }),

        ...(form.heightCm !== "" && {
          heightCm: Number(form.heightCm),
        }),
      };

      const res = await api.post("/api/v1/package", payload);

      toast.success(res.data?.message || "Package created successfully");

      const packageId = res.data.data.id;

      router.push(
        `${basePath}/shipments/${shipmentId}/packages/${packageId}${
          partnerId ? `?partnerId=${partnerId}` : ""
        }`,
      );
    } catch (error: any) {
      console.error("Create package error:", error);

      toast.error(error?.response?.data?.message || "Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.push(
      `${basePath}/shipments/${shipmentId}/packages${
        partnerId ? `?partnerId=${partnerId}` : ""
      }`,
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loadingShipment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading shipment...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* BACK */}

        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft size={17} />
          Back to Packages
        </button>

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
              <PackagePlus size={23} className="text-secondary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Package</h1>

              <p className="text-sm text-gray-500 mt-1">
                Add a new package to this shipment.
              </p>
            </div>
          </div>
        </div>

        {/* SHIPMENT CARD */}

        {shipment && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Truck size={19} className="text-gray-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Shipment</p>

                  <p className="font-semibold text-gray-900">
                    {shipment.trackingNumber}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                <CheckCircle2 size={14} />
                {shipment.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Origin</p>

                <p className="text-sm font-medium text-gray-900">
                  {shipment.origin}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500 mb-1">Destination</p>

                <p className="text-sm font-medium text-gray-900">
                  {shipment.destination}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}

            <div className="lg:col-span-2 space-y-6">
              {/* BASIC INFORMATION */}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Box size={18} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Package Information
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Enter basic package details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="e.g. Electronics, clothing, documents..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition resize-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Optional. Add a short description of the package contents.
                  </p>
                </div>
              </div>

              {/* WEIGHT */}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Scale size={18} className="text-purple-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Weight & Dimensions
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Package measurement information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* WEIGHT */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.weightKg}
                        onChange={(e) =>
                          handleChange("weightKg", e.target.value)
                        }
                        placeholder="5.00"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-14 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                        KG
                      </span>
                    </div>
                  </div>

                  {/* DIMENSIONS */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dimensions
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* LENGTH */}

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.lengthCm}
                          onChange={(e) =>
                            handleChange("lengthCm", e.target.value)
                          }
                          placeholder="Length"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          CM
                        </span>
                      </div>

                      {/* WIDTH */}

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.widthCm}
                          onChange={(e) =>
                            handleChange("widthCm", e.target.value)
                          }
                          placeholder="Width"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          CM
                        </span>
                      </div>

                      {/* HEIGHT */}

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.heightCm}
                          onChange={(e) =>
                            handleChange("heightCm", e.target.value)
                          }
                          placeholder="Height"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          CM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY */}

            <div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm sticky top-6 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Ruler size={18} className="text-secondary" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Package Summary
                      </h2>

                      <p className="text-xs text-gray-500">
                        Review before creating.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Weight</span>

                      <span className="text-sm font-semibold text-gray-900">
                        {Number(form.weightKg || 0).toFixed(2)} KG
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Dimensions</span>

                      <span className="text-sm font-semibold text-gray-900">
                        {form.lengthCm && form.widthCm && form.heightCm
                          ? `${form.lengthCm} × ${form.widthCm} × ${form.heightCm} CM`
                          : "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Volume</span>

                      <span className="text-sm font-semibold text-gray-900">
                        {volume > 0 ? `${volume.toLocaleString()} CM³` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-6" />

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <Box size={18} className="text-secondary mt-0.5" />

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Ready to add
                        </p>

                        <p className="text-xs text-gray-500 mt-1 leading-5">
                          This package will be linked to shipment{" "}
                          <span className="font-semibold">
                            {shipment?.trackingNumber}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-6 h-12 rounded-xl bg-secondary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Package...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Create Package
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={saving}
                    className="w-full mt-3 h-11 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePackage;
