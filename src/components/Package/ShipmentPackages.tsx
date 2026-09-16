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
// NOTE: assumption — generatePackageLabelPdf() returns a pdf-lib
// PDFDocument (based on how `pdfDoc` is passed straight into
// PrintLabelModal). If that's wrong, share packageLabelPdf.ts and
// Printlabelmodal.tsx so the merge logic below can be corrected.
import { PDFDocument } from "pdf-lib";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  generatePackageLabelPdf,
  getPackageLabelPdfBlob,
} from "./packageLabelPdf";
import PrintLabelModal from "./Printlabelmodal";

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
  trackingNumber?: string;
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
  trackingNumber,
  onPackagesChanged,
}: ShipmentPackagesProps) => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [labelPreviewImage, setLabelPreviewImage] = useState<string | null>(
    null,
  );
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
  // PRINT ALL LABELS
  // ============================================================

  const [printingAll, setPrintingAll] = useState(false);

  // ============================================================
  // PRINT / SHARE MODAL
  // ============================================================

  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [labelPdfDoc, setLabelPdfDoc] = useState<any>(null);
  const [labelFileName, setLabelFileName] = useState("");
  const [labelShareText, setLabelShareText] = useState("");

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

  // ============================================================
  // PRINT LABEL — generates the PDF, then opens the action modal
  // (Print / Download / Share via WhatsApp) instead of printing
  // automatically.
  // ============================================================

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

      const pdfDoc = await generatePackageLabelPdf(labelData);
      setLabelPdfDoc(pdfDoc);
      setLabelFileName(
        `${labelData.package?.packageCode || "package-label"}.pdf`,
      );
      setLabelShareText(
        `Package: ${labelData.package?.packageCode || "—"}\nTracking: ${labelData.shipment?.trackingNumber || "—"}`,
      );
      setLabelModalOpen(true);
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
  // PRINT ALL LABELS
  //
  // Fetches label data for every package in this shipment,
  // generates each package's label PDF individually (reusing the
  // same generatePackageLabelPdf used for single-package print),
  // then merges every generated PDF's pages into ONE combined
  // PDFDocument using pdf-lib. The merged document is opened in
  // the same Print/Download/Share modal used for a single label.
  // ============================================================

  const handlePrintAllLabels = async () => {
    if (!packages.length) {
      toast.error("No packages to print");
      return;
    }

    try {
      setPrintingAll(true);

      const mergedPdf = await PDFDocument.create();
      let mergedCount = 0;

      for (const pkg of packages) {
        const res = await api.get(
          `/api/v1/package/${pkg.id}/label${
            partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : ""
          }`,
        );

        const labelData = res.data.data;
        if (!labelData) {
          console.warn(`Label data not found for package ${pkg.id}, skipping`);
          continue;
        }

        // generatePackageLabelPdf() pdfMake ডকুমেন্ট রিটার্ন করে —
        // pdf-lib দিয়ে merge করার জন্য আগে raw bytes-এ নামাতে হবে।
        const singlePdfMakeDoc = await generatePackageLabelPdf(labelData);
        const singleBlob = await getPackageLabelPdfBlob(singlePdfMakeDoc);
        const singleBytes = await singleBlob.arrayBuffer();

        const singlePdf = await PDFDocument.load(singleBytes);
        const copiedPages = await mergedPdf.copyPages(
          singlePdf,
          singlePdf.getPageIndices(),
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        mergedCount += 1;
      }

      if (mergedCount === 0) {
        toast.error("Could not generate any package labels");
        return;
      }

      const mergedBytes = await mergedPdf.save();

      const buffer = new ArrayBuffer(mergedBytes.byteLength);
      new Uint8Array(buffer).set(mergedBytes);

      const mergedBlob = new Blob([buffer], {
        type: "application/pdf",
      });

      // PrintLabelModal শুধু .getBlob(cb) আর .download(filename)
      // মেথড দুটোই কল করে — তাই merged pdf-lib bytes-কে ঠিক ওই
      // দুটো মেথড-সহ pdfMake-স্টাইলের object হিসেবে wrap করে দিলেই
      // মডাল অপরিবর্তিত রেখে print/download/share সব কাজ করবে।
      const mergedPdfMakeStyleDoc = {
        getBlob: (cb: (blob: Blob) => void) => cb(mergedBlob),
        download: (filename?: string) => {
          const url = URL.createObjectURL(mergedBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename || "all-package-labels.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
      };

      setLabelPdfDoc(mergedPdfMakeStyleDoc);
      setLabelFileName(
        `${trackingNumber || "shipment"}-all-package-labels.pdf`,
      );
      setLabelShareText(
        `All package labels for shipment ${trackingNumber || "—"} (${mergedCount} package${
          mergedCount > 1 ? "s" : ""
        })`,
      );

      setLabelModalOpen(true);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to generate all labels",
      );
    } finally {
      setPrintingAll(false);
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

            <div className="flex items-center gap-2.5">
              {/* PRINT ALL LABELS */}

              <button
                type="button"
                onClick={handlePrintAllLabels}
                disabled={printingAll || packages.length === 0}
                className="
                  inline-flex items-center justify-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  border border-gray-200
                  bg-white
                  text-gray-700
                  text-sm font-medium
                  shadow-sm
                  hover:bg-gray-50
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {printingAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Printer size={16} />
                )}
                {printingAll ? "Preparing..." : "Print All Labels"}
              </button>

              {/* ADD PACKAGE */}

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

      {/* ========================================================
          PRINT / DOWNLOAD / SHARE LABEL MODAL
          (used for BOTH single-label print and "print all" — the
          merged multi-page PDF just opens in the same viewer)
      ======================================================== */}

      <PrintLabelModal
        open={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        pdfDoc={labelPdfDoc}
        fileName={labelFileName}
        shareText={labelShareText}
      />
    </>
  );
};

export default ShipmentPackages;
