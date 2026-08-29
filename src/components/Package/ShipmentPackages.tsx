"use client";

import api from "@/lib/axios";
import {
  Box,
  CheckCircle2,
  Edit3,
  Loader2,
  PackagePlus,
  Printer,
  Ruler,
  Scale,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { packageLabelPdf } from "./packageLabelPdf";
interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
}

interface ScanEvent {
  id: string;
  scannedAt: string;
  location?: string | null;
  status?: string | null;
}

interface PackageData {
  id: string;
  packageCode: string;
  description?: string | null;

  weightKg: number;

  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;

  status: string;

  createdAt: string;

  shipment?: Shipment;

  scanEvents?: ScanEvent[];
}

interface ShipmentPackagesProps {
  shipmentId: string;
  partnerId?: string;
  shipmentStatus?: string;
  onPackagesChanged?: () => void;
}

interface PackageForm {
  description: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
}

const EMPTY_FORM: PackageForm = {
  description: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
};

const ShipmentPackages = ({
  shipmentId,
  partnerId,
  shipmentStatus,
  onPackagesChanged,
}: ShipmentPackagesProps) => {
  const [packages, setPackages] = useState<PackageData[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingPackage, setEditingPackage] = useState<PackageData | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
  const [printingId, setPrintingId] = useState<string | null>(null);
  // ============================================================
  // LOCKED SHIPMENT
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const isLocked =
    shipmentStatus === "DELIVERED" || shipmentStatus === "CANCELLED";

  // ============================================================
  // QUERY
  // ============================================================

  const partnerQuery = partnerId
    ? `?partnerId=${encodeURIComponent(partnerId)}`
    : "";

  // ============================================================
  // LOAD PACKAGES
  // ============================================================

  const fetchPackages = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/v1/package/shipment/${shipmentId}${partnerQuery}`,
      );

      setPackages(res.data.data || []);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to load shipment packages",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) {
      fetchPackages();
    }
  }, [shipmentId, partnerId]);

  // ============================================================
  // TOTAL WEIGHT
  // ============================================================

  const totalWeight = useMemo(() => {
    return packages.reduce(
      (total, item) => total + Number(item.weightKg || 0),
      0,
    );
  }, [packages]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (field: keyof PackageForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const openCreate = () => {
    if (isLocked) {
      toast.error("Packages cannot be added to a completed shipment");
      return;
    }

    setEditingPackage(null);

    setForm(EMPTY_FORM);

    setShowForm(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEdit = (item: PackageData) => {
    if (isLocked) {
      toast.error("Packages cannot be updated for a completed shipment");
      return;
    }

    setEditingPackage(item);

    setForm({
      description: item.description || "",
      weightKg: String(item.weightKg ?? ""),
      lengthCm:
        item.lengthCm !== null && item.lengthCm !== undefined
          ? String(item.lengthCm)
          : "",
      widthCm:
        item.widthCm !== null && item.widthCm !== undefined
          ? String(item.widthCm)
          : "",
      heightCm:
        item.heightCm !== null && item.heightCm !== undefined
          ? String(item.heightCm)
          : "",
    });

    setOpenMenu(null);

    setShowForm(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    setEditingPackage(null);

    setForm(EMPTY_FORM);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.weightKg || Number(form.weightKg) <= 0) {
      toast.error("Enter a valid package weight");

      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...(partnerId && {
          partnerId,
        }),

        ...(editingPackage
          ? {}
          : {
              shipmentId,
            }),

        description: form.description.trim() || undefined,

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

      if (editingPackage) {
        await api.patch(
          `/api/v1/package/${editingPackage.id}${partnerQuery}`,
          payload,
        );

        toast.success("Package updated successfully");
      } else {
        await api.post("/api/v1/package", payload);

        toast.success("Package added successfully");
      }

      closeForm();

      await fetchPackages();
      onPackagesChanged?.();
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id: string) => {
    if (isLocked) {
      toast.error("Packages cannot be deleted from a completed shipment");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this package?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(`/api/v1/package/${id}${partnerQuery}`);

      toast.success("Package deleted successfully");

      setOpenMenu(null);

      await fetchPackages();
      onPackagesChanged?.();
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to delete package");
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";

      case "IN_TRANSIT":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  const basePath = `/superadmin/partners/${encodeURIComponent(partnerId || "")}`;
  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  const handlePrintLabel = async (packageId: string) => {
    try {
      setPrintingId(packageId);

      const res = await api.get(
        `/api/v1/package/${packageId}/label${
          partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : ""
        }`,
      );

      const labelData = res.data.data;

      if (!labelData) {
        toast.error("Label data not found");
        return;
      }

      // ✅ অন্য file-এর PDF function
      await packageLabelPdf(labelData);

      toast.success("Label ready for printing");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to generate package label",
      );
    } finally {
      setPrintingId(null);
    }
  };
  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Box size={20} className="text-secondary" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Packages
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage packages included in this shipment
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreate}
              disabled={isLocked}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                rounded-xl
                bg-secondary
                text-white
                text-sm font-medium
                shadow-sm
                hover:opacity-90
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <PackagePlus size={17} />
              Add Package
            </button>
          </div>
        </div>

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-3 border-b border-gray-200">
          <div className="p-5 border-r border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Packages
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {packages.length}
            </p>
          </div>

          <div className="p-5 border-r lg:border-r border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Weight
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalWeight.toFixed(2)}
              <span className="text-sm font-medium text-gray-500 ml-1">KG</span>
            </p>
          </div>

          <div className="hidden lg:block p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Shipment Status
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                  shipmentStatus || "PENDING",
                )}`}
              >
                {shipmentStatus || "PENDING"}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {packages.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center">
              <Box size={26} className="text-gray-400" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No packages yet
            </h3>

            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Add the packages included in this shipment to keep weight,
              dimensions and tracking information organized.
            </p>

            {!isLocked && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                <PackagePlus size={17} />
                Add First Package
              </button>
            )}
          </div>
        ) : (
          /* ====================================================
             PACKAGE LIST
          ==================================================== */

          <div className="divide-y divide-gray-100">
            {packages.map((item, index) => {
              const dimensions =
                item.lengthCm && item.widthCm && item.heightCm
                  ? `${item.lengthCm} × ${item.widthCm} × ${item.heightCm} cm`
                  : "Dimensions not specified";

              return (
                <div
                  key={item.id}
                  className="px-6 py-5 hover:bg-gray-50/70 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    {/* PACKAGE NUMBER */}

                    <div className="flex items-center gap-4 min-w-0 lg:w-[30%]">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Box size={20} className="text-gray-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            #{index + 1}
                          </span>

                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.packageCode}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {item.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
                      <div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Scale size={14} />

                          <span className="text-xs">Weight</span>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {Number(item.weightKg).toFixed(2)} KG
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Ruler size={14} />

                          <span className="text-xs">Dimensions</span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {dimensions}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <CheckCircle2 size={14} />

                          <span className="text-xs">Status</span>
                        </div>

                        <div className="mt-1">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full border text-[11px] font-medium ${getStatusClass(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION */}

                    <div ref={menuRef} className="flex items-center gap-2">
                      {/* PRINT */}
                      <Button
                        type="button"
                        onClick={() => handlePrintLabel(item.id)}
                        disabled={printingId === item.id}
                        className=""
                      >
                        {printingId === item.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Printer size={15} />
                        )}

                        <span>
                          {printingId === item.id ? "Preparing..." : "Print"}
                        </span>
                      </Button>

                      {/* EDIT */}
                      <Button
                        type="button"
                        disabled={isLocked}
                        onClick={() => openEdit(item)}
                        className="
      h-9
      w-9
      p-0
      inline-flex
      items-center
      justify-center
      rounded-lg
      border
      border-gray-200
      bg-white
      text-gray-600
      shadow-sm
      hover:bg-gray-50
      hover:text-gray-900
      transition-colors
      disabled:opacity-40
      disabled:cursor-not-allowed
    "
                      >
                        <Edit3 size={15} />
                      </Button>

                      {/* DELETE */}
                      <Button
                        type="button"
                        disabled={isLocked || deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="
      h-9
      w-9
      p-0
      inline-flex
      items-center
      justify-center
      rounded-lg
      border
      border-red-100
      bg-red-50
      text-red-600
      shadow-sm
      hover:bg-red-100
      hover:text-red-700
      transition-colors
      disabled:opacity-40
      disabled:cursor-not-allowed
    "
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          PACKAGE MODAL
      ======================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeForm}
          />

          {/* MODAL */}

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPackage ? "Edit Package" : "Add Package"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {editingPackage
                    ? `Update ${editingPackage.packageCode}`
                    : "Enter package information"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* DESCRIPTION */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <input
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="e.g. Electronics, Documents, Clothing"
                    className="
                      mt-1.5 w-full
                      h-11
                      rounded-xl
                      border border-gray-200
                      px-3.5
                      text-sm
                      outline-none
                      focus:border-secondary
                      focus:ring-2
                      focus:ring-secondary/10
                    "
                  />
                </div>

                {/* WEIGHT */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (KG) *
                  </label>

                  <div className="relative mt-1.5">
                    <Scale
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={form.weightKg}
                      onChange={(e) => handleChange("weightKg", e.target.value)}
                      placeholder="5.00"
                      className="
                        w-full
                        h-11
                        rounded-xl
                        border border-gray-200
                        pl-10 pr-3.5
                        text-sm
                        outline-none
                        focus:border-secondary
                        focus:ring-2
                        focus:ring-secondary/10
                      "
                    />
                  </div>
                </div>

                {/* DIMENSIONS */}

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Dimensions
                    </label>

                    <span className="text-xs text-gray-400">Centimeters</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.lengthCm}
                      onChange={(e) => handleChange("lengthCm", e.target.value)}
                      placeholder="Length"
                      className="
                        h-11
                        rounded-xl
                        border border-gray-200
                        px-3
                        text-sm
                        outline-none
                        focus:border-secondary
                      "
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.widthCm}
                      onChange={(e) => handleChange("widthCm", e.target.value)}
                      placeholder="Width"
                      className="
                        h-11
                        rounded-xl
                        border border-gray-200
                        px-3
                        text-sm
                        outline-none
                        focus:border-secondary
                      "
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.heightCm}
                      onChange={(e) => handleChange("heightCm", e.target.value)}
                      placeholder="Height"
                      className="
                        h-11
                        rounded-xl
                        border border-gray-200
                        px-3
                        text-sm
                        outline-none
                        focus:border-secondary
                      "
                    />
                  </div>
                </div>

                {/* INFO */}

                {!editingPackage && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                    <p className="text-xs leading-5 text-blue-700">
                      Package code will be generated automatically from the
                      shipment tracking number.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    px-4 py-2.5
                    rounded-xl
                    border border-gray-200
                    bg-white
                    text-sm font-medium
                    text-gray-700
                    hover:bg-gray-100
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    min-w-[130px]
                    px-4 py-2.5
                    rounded-xl
                    bg-secondary
                    text-white
                    text-sm font-medium
                    flex items-center justify-center gap-2
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingPackage ? (
                    <>
                      <Edit3 size={16} />
                      Update Package
                    </>
                  ) : (
                    <>
                      <PackagePlus size={16} />
                      Add Package
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShipmentPackages;
