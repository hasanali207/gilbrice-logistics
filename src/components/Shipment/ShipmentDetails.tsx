"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  DollarSign,
  Edit,
  Loader2,
  MapPin,
  Package as PackageIcon,
  RefreshCw,
  Save,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import ShipmentPackages from "../Package/ShipmentPackages";
import { Button } from "../ui/button";

// ============================================================
// OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  "BOOKED",
  "RECEIVED",
  "WEIGHED",
  "MANIFESTED",
  "LOADED",
  "DEPARTED",
  "ARRIVED",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
];

const MODE_OPTIONS = ["AIR", "SEA", "ROAD", "COURIER"];

// ============================================================
// TYPES
// ============================================================

interface ShipmentStatusHistory {
  id: string;
  status: string;
  note?: string | null;
  location?: string | null;
  createdAt: string;
}

interface ShipmentPackage {
  id: string;
  [key: string]: any;
}

interface ShipmentPayment {
  id: string;
  amount: number | string;
  method?: string;
  transactionRef?: string | null;
  paidAt?: string;
  status?: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;

  status: string;
  mode: string;

  origin: string;
  destination: string;

  actualWeightKg: number | string;
  volumetricWeightKg: number | string | null;
  chargeableWeightKg: number | string;

  wholesaleRatePerKg: number | string;
  retailRatePerKg: number | string;

  partnerCost: number | string;
  customerPrice: number | string;

  discount: number | string;
  additionalFees: number | string;

  finalCustomerAmount: number | string;

  amountPaidByCustomer: number | string;
  customerBalance: number | string;

  createdAt: string;
  updatedAt?: string;

  partner: {
    id: string;
    companyName: string;
    trackingPrefix: string;

    [key: string]: any;
  };

  customer: {
    id: string;
    fullName?: string;
    name?: string;

    phone: string | null;
    whatsapp?: string | null;
    email?: string | null;

    [key: string]: any;
  };

  packages?: ShipmentPackage[];

  payments?: ShipmentPayment[];

  statusHistory?: ShipmentStatusHistory[];

  ledgerEntry?: any;
}

// ============================================================
// HELPERS
// ============================================================

const formatAmount = (value: number | string | null | undefined) => {
  return Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const displayStatus = (status?: string) => {
  if (!status) return "—";

  return status.replaceAll("_", " ");
};

const statusClass = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "ARRIVED":
    case "READY_FOR_PICKUP":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

    case "DEPARTED":
    case "LOADED":
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";

    case "BOOKED":
    case "RECEIVED":
    case "WEIGHED":
    case "MANIFESTED":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    default:
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
  }
};

// ============================================================
// SECTION CARD WRAPPER
// ============================================================

const SectionCard = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-5 sm:px-6 lg:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-gray-100 min-w-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 sm:px-6 lg:px-7 py-5 sm:py-6 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ============================================================
// INFO COMPONENT
// ============================================================

const Info = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="font-medium text-gray-800 mt-1.5 break-words [overflow-wrap:anywhere]">
        {value || "—"}
      </p>
    </div>
  );
};

// ============================================================
// PRICE COMPONENT
// ============================================================

const Price = ({
  label,
  value,
  bold = false,
  danger = false,
  success = false,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  danger?: boolean;
  success?: boolean;
}) => {
  return (
    <div className="flex justify-between items-center gap-4 py-2.5">
      <span
        className={
          bold ? "font-semibold text-gray-900" : "text-sm text-gray-500"
        }
      >
        {label}
      </span>

      <span
        className={[
          bold ? "text-base font-bold" : "font-medium",
          danger
            ? "text-red-600"
            : success
              ? "text-emerald-600"
              : "text-gray-900",
        ].join(" ")}
      >
        $ {formatAmount(value)}
      </span>
    </div>
  );
};

// ============================================================
// PAGE
// ============================================================

const ShipmentDetails = () => {
  const router = useRouter();
  const VOLUMETRIC_DIVISOR = 5000;
  const params = useParams();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  const shipmentId = params?.id as string;

  const urlPartnerId = searchParams.get("partnerId") || "";

  const [resolvedPartnerId, setResolvedPartnerId] = useState("");

  const partnerId = useMemo(() => {
    return urlPartnerId || resolvedPartnerId;
  }, [urlPartnerId, resolvedPartnerId]);

  const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : "";

  const [shipment, setShipment] = useState<Shipment | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [changingStatus, setChangingStatus] = useState(false);

  const [editForm, setEditForm] = useState({
    mode: "",
    origin: "",
    destination: "",

    actualWeightKg: "",
    lengthCm: "", // 👈 নতুন
    widthCm: "", // 👈 নতুন
    heightCm: "", // 👈 নতুন

    retailRatePerKg: "",

    discount: "",
    additionalFees: "",
  });

  const calculatedVolumetricWeight = useMemo(() => {
    const l = Number(editForm.lengthCm || 0);
    const w = Number(editForm.widthCm || 0);
    const h = Number(editForm.heightCm || 0);

    if (l > 0 && w > 0 && h > 0) {
      return (l * w * h) / VOLUMETRIC_DIVISOR;
    }

    return 0;
  }, [editForm.lengthCm, editForm.widthCm, editForm.heightCm]);

  const [statusForm, setStatusForm] = useState({
    status: "",
    note: "",
    location: "",
  });

  const populateForms = (data: Shipment) => {
    setEditForm({
      mode: data.mode || "",
      origin: data.origin || "",
      destination: data.destination || "",

      actualWeightKg:
        data.actualWeightKg !== undefined && data.actualWeightKg !== null
          ? String(data.actualWeightKg)
          : "",

      lengthCm: "", // 👈 dimension store করা হয় না, তাই খালি শুরু হবে
      widthCm: "",
      heightCm: "",

      retailRatePerKg:
        data.retailRatePerKg !== undefined && data.retailRatePerKg !== null
          ? String(data.retailRatePerKg)
          : "",

      discount:
        data.discount !== undefined && data.discount !== null
          ? String(data.discount)
          : "0",

      additionalFees:
        data.additionalFees !== undefined && data.additionalFees !== null
          ? String(data.additionalFees)
          : "0",
    });

    setStatusForm({
      status: data.status || "",
      note: "",
      location: "",
    });
  };

  const fetchShipment = async () => {
    if (!shipmentId) return;

    try {
      setRefreshing(true);

      const url = `/api/v1/shipment/${shipmentId}${query}`;

      console.log("FETCH SHIPMENT:", url);

      const res = await api.get(url);

      const data: Shipment | undefined = res.data?.data;

      if (!data) {
        throw new Error("Shipment data not found");
      }

      setShipment(data);

      if (data.partner?.id) {
        setResolvedPartnerId(data.partner.id);
      }

      populateForms(data);
    } catch (error: any) {
      console.error("Failed to load shipment:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load shipment";

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!shipmentId) return;

    fetchShipment();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId, urlPartnerId]);

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!shipment) return;

    if (!partnerId) {
      toast.error("Partner information is required to update this shipment");

      return;
    }

    if (!editForm.origin.trim()) {
      toast.error("Origin is required");
      return;
    }

    if (!editForm.destination.trim()) {
      toast.error("Destination is required");
      return;
    }

    const actualWeight = Number(editForm.actualWeightKg);

    if (!actualWeight || actualWeight <= 0) {
      toast.error("Actual weight must be greater than 0");
      return;
    }

    // যদি dimension দেওয়া হয়, নতুন calculated volumetric ব্যবহার হবে
    // যদি dimension খালি রাখা হয়, existing shipment এর volumetric weight ই থাকবে (change হবে না)
    const volumetricWeight =
      calculatedVolumetricWeight > 0
        ? calculatedVolumetricWeight
        : Number(shipment.volumetricWeightKg || 0);

    const retailRate = Number(editForm.retailRatePerKg);

    if (retailRate < 0) {
      toast.error("Retail rate cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        mode: editForm.mode,
        origin: editForm.origin.trim(),
        destination: editForm.destination.trim(),
        actualWeightKg: actualWeight,
        volumetricWeightKg: volumetricWeight, // 👈 এটা একই থাকবে, শুধু source পাল্টালো
        retailRatePerKg: retailRate,
        discount: Number(editForm.discount || 0),
        additionalFees: Number(editForm.additionalFees || 0),
      };

      const url = `/api/v1/shipment/${shipment.id}${query}`;

      console.log("UPDATE SHIPMENT:", url);

      const res = await api.patch(url, payload);

      const updatedShipment: Shipment = res.data?.data;

      if (!updatedShipment) {
        throw new Error("Updated shipment data not found");
      }

      setShipment(updatedShipment);

      if (updatedShipment.partner?.id) {
        setResolvedPartnerId(updatedShipment.partner.id);
      }

      populateForms(updatedShipment);

      setEditing(false);

      toast.success("Shipment updated successfully");

      await fetchShipment();
    } catch (error: any) {
      console.error("Failed to update shipment:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update shipment",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!shipment) return;

    if (!partnerId) {
      toast.error("Partner information is required to update shipment status");

      return;
    }

    if (!statusForm.status) {
      toast.error("Status is required");
      return;
    }

    if (statusForm.status === shipment.status) {
      toast.error(`Shipment is already ${displayStatus(shipment.status)}`);

      return;
    }

    try {
      setChangingStatus(true);

      const url = `/api/v1/shipment/${shipment.id}/status${query}`;

      console.log("UPDATE SHIPMENT STATUS:", url);

      const res = await api.patch(url, {
        status: statusForm.status,

        note: statusForm.note.trim() || undefined,

        location: statusForm.location.trim() || undefined,
      });

      const updatedShipment: Shipment = res.data?.data;

      if (!updatedShipment) {
        throw new Error("Updated shipment data not found");
      }

      setShipment(updatedShipment);

      if (updatedShipment.partner?.id) {
        setResolvedPartnerId(updatedShipment.partner.id);
      }

      setStatusForm({
        status: updatedShipment.status,
        note: "",
        location: "",
      });

      toast.success("Shipment status updated successfully");

      await fetchShipment();
    } catch (error: any) {
      console.error("Failed to update shipment status:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update shipment status",
      );
    } finally {
      setChangingStatus(false);
    }
  };

  const handleBack = () => {
    if (partnerId) {
      router.push(`${basePath}/partners/${partnerId}/shipments`);

      return;
    }

    router.push(`${basePath}/shipments`);
  };

  const canEdit =
    shipment?.status !== "DELIVERED" && shipment?.status !== "CANCELLED";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6">
        <div className="flex flex-col justify-center items-center text-gray-500 gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm">Loading shipment...</span>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12">
          <Truck size={40} className="mx-auto text-gray-300 mb-4" />

          <p className="text-gray-500">Shipment not found.</p>

          <button
            onClick={handleBack}
            className="mt-6 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  const customerName =
    shipment.customer?.fullName || shipment.customer?.name || "—";

  return (
    <div className="w-full max-w-7xl mx-auto py-5 sm:py-7 lg:py-8 px-3 sm:px-5 lg:px-8 space-y-5 sm:space-y-6 lg:space-y-7 overflow-x-hidden">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col  lg:items-center lg:justify-between gap-5 lg:gap-6 pb-1 min-w-0">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition mb-5"
          >
            <ArrowLeft size={16} />
            Back to Shipments
          </button>

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Truck size={24} className="text-secondary" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {shipment.trackingNumber}
                </h1>

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusClass(
                    shipment.status,
                  )}`}
                >
                  {displayStatus(shipment.status)}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1.5">
                Created {formatDate(shipment.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-5 sm:gap-3 flex-wrap w-full lg:w-auto shrink-0">
          <button
            onClick={fetchShipment}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition min-h-11"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center gap-2 bg-secondary text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 shadow-sm transition min-h-11"
            >
              <Edit size={16} />
              Edit Shipment
            </button>
          )}

          <Link href={`${basePath}/shipments/${shipmentId}/payment`}>
            <Button size="sm" variant="outline">
              <DollarSign size={14} /> Pay Payments
            </Button>
          </Link>
        </div>
      </div>

      {/* ======================================================
          PARTNER CONTEXT
      ====================================================== */}

      {partnerId && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl px-5 sm:px-6 lg:px-7 py-4 sm:py-5 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">
                Partner
              </p>
              <p className="font-semibold text-gray-800 mt-1.5">
                {shipment.partner?.companyName || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">
                Tracking Prefix
              </p>
              <p className="font-mono font-semibold text-gray-800 mt-1.5">
                {shipment.partner?.trackingPrefix || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">
                Partner ID
              </p>
              <p className="font-mono text-xs text-gray-600 mt-1.5 break-all">
                {partnerId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          STATUS UPDATE
      ====================================================== */}

      {canEdit && (
        <SectionCard
          title="Update Shipment Status"
          subtitle="Change shipment status and optionally add location or note."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 min-w-0">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {displayStatus(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Location
              </label>

              <input
                value={statusForm.location}
                onChange={(e) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Houston, US"
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Note</label>

              <input
                value={statusForm.note}
                onChange={(e) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Shipment arrived"
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleStatusChange}
                disabled={
                  changingStatus ||
                  !statusForm.status ||
                  statusForm.status === shipment.status
                }
                className="w-full min-w-0 h-11 bg-secondary text-white rounded-xl px-5 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm transition"
              >
                {changingStatus ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Update Status
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ======================================================
          EDIT FORM
      ====================================================== */}

      {editing && canEdit && (
        <SectionCard
          title="Edit Shipment"
          subtitle="Update shipment information."
          action={
            <button
              onClick={() => {
                setEditing(false);
                populateForms(shipment);
              }}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 min-w-0">
            <div>
              <label className="text-sm font-medium text-gray-700">Mode</label>

              <select
                value={editForm.mode}
                onChange={(e) => handleEditChange("mode", e.target.value)}
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              >
                {MODE_OPTIONS.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Origin
              </label>

              <input
                value={editForm.origin}
                onChange={(e) => handleEditChange("origin", e.target.value)}
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Destination
              </label>

              <input
                value={editForm.destination}
                onChange={(e) =>
                  handleEditChange("destination", e.target.value)
                }
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Actual Weight KG
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.actualWeightKg}
                onChange={(e) =>
                  handleEditChange("actualWeightKg", e.target.value)
                }
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className="text-sm font-medium text-gray-700">
                Dimensions (L × W × H in cm) — Volumetric Weight
              </label>

              <div className="grid grid-cols-3 gap-3 mt-1.5">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.lengthCm}
                  onChange={(e) => handleEditChange("lengthCm", e.target.value)}
                  placeholder="Length (cm)"
                  className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.widthCm}
                  onChange={(e) => handleEditChange("widthCm", e.target.value)}
                  placeholder="Width (cm)"
                  className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.heightCm}
                  onChange={(e) => handleEditChange("heightCm", e.target.value)}
                  placeholder="Height (cm)"
                  className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {calculatedVolumetricWeight > 0 ? (
                  <>
                    New calculated volumetric weight:{" "}
                    <span className="font-semibold text-gray-700">
                      {calculatedVolumetricWeight.toFixed(2)} KG
                    </span>
                  </>
                ) : (
                  <>
                    Current volumetric weight:{" "}
                    <span className="font-semibold text-gray-700">
                      {Number(shipment.volumetricWeightKg || 0).toFixed(2)} KG
                    </span>{" "}
                    (leave dimensions empty to keep unchanged)
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Retail Rate / KG
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.retailRatePerKg}
                onChange={(e) =>
                  handleEditChange("retailRatePerKg", e.target.value)
                }
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Discount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.discount}
                onChange={(e) => handleEditChange("discount", e.target.value)}
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Additional Fees
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.additionalFees}
                onChange={(e) =>
                  handleEditChange("additionalFees", e.target.value)
                }
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setEditing(false);
                populateForms(shipment);
              }}
              className="w-full sm:w-auto border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition inline-flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full sm:w-auto bg-secondary text-white rounded-xl px-5 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm transition"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </SectionCard>
      )}

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start min-w-0">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6 min-w-0">
          <SectionCard title="Shipment Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 min-w-0">
              <Info label="Tracking Number" value={shipment.trackingNumber} />
              <Info label="Mode" value={shipment.mode} />
              <Info label="Origin" value={shipment.origin} />
              <Info label="Destination" value={shipment.destination} />
              <Info
                label="Actual Weight"
                value={`${Number(shipment.actualWeightKg || 0).toFixed(2)} KG`}
              />
              <Info
                label="Volumetric Weight"
                value={`${Number(shipment.volumetricWeightKg || 0).toFixed(
                  2,
                )} KG`}
              />
              <Info
                label="Chargeable Weight"
                value={`${Number(shipment.chargeableWeightKg || 0).toFixed(
                  2,
                )} KG`}
              />
              <Info label="Status" value={displayStatus(shipment.status)} />
            </div>
          </SectionCard>

          <SectionCard
            title="Customer"
            action={
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <User size={18} className="text-gray-400" />
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 min-w-0">
              <Info label="Name" value={customerName} />
              <Info label="Phone" value={shipment.customer?.phone || "—"} />
              <Info
                label="WhatsApp"
                value={shipment.customer?.whatsapp || "—"}
              />
              <Info label="Email" value={shipment.customer?.email || "—"} />
            </div>
          </SectionCard>

          <ShipmentPackages
            shipmentId={shipment.id}
            partnerId={partnerId}
            shipmentStatus={shipment.status}
            onPackagesChanged={fetchShipment}
          />

          <SectionCard title="Status History">
            <div className="space-y-0">
              {shipment.statusHistory?.map((history, idx) => (
                <div
                  key={history.id}
                  className={`flex gap-3 sm:gap-4 py-4 sm:py-5 min-w-0 ${
                    idx !== (shipment.statusHistory?.length || 0) - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                      <span
                        className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(
                          history.status,
                        )}`}
                      >
                        {displayStatus(history.status)}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatDate(history.createdAt)}
                      </span>
                    </div>

                    {history.location && (
                      <p className="text-sm text-gray-500 mt-2.5 flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        {history.location}
                      </p>
                    )}

                    {history.note && (
                      <p className="text-sm text-gray-500 mt-1.5">
                        {history.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!shipment.statusHistory?.length && (
                <p className="text-sm text-gray-400 py-2">
                  No status history found.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-5 sm:space-y-6 min-w-0">
          <SectionCard title="Partner">
            <div className="space-y-5">
              <Info
                label="Company"
                value={shipment.partner?.companyName || "—"}
              />
              <Info
                label="Tracking Prefix"
                value={shipment.partner?.trackingPrefix || "—"}
              />
              <Info label="Partner ID" value={shipment.partner?.id || "—"} />
            </div>
          </SectionCard>

          <SectionCard title="Pricing">
            <div className="divide-y divide-gray-100">
              <Price
                label="Wholesale Rate / KG"
                value={shipment.wholesaleRatePerKg}
              />
              <Price
                label="Retail Rate / KG"
                value={shipment.retailRatePerKg}
              />
              <Price label="Partner Cost" value={shipment.partnerCost} />
              <Price label="Customer Price" value={shipment.customerPrice} />
              <Price label="Discount" value={shipment.discount} />
              <Price label="Additional Fees" value={shipment.additionalFees} />
            </div>

            <div className="border-t border-gray-100 mt-2 pt-4">
              <Price
                label="Final Customer Amount"
                value={shipment.finalCustomerAmount}
                bold
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Payment"
            action={
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <PackageIcon size={18} className="text-gray-400" />
              </div>
            }
          >
            <Price
              label="Customer Paid"
              value={shipment.amountPaidByCustomer}
              success={Number(shipment.amountPaidByCustomer) > 0}
            />

            <div className="border-t border-gray-100 mt-2 pt-3">
              <Price
                label="Customer Balance"
                value={shipment.customerBalance}
                bold
                danger={Number(shipment.customerBalance) > 0}
                success={Number(shipment.customerBalance) <= 0}
              />
            </div>
          </SectionCard>

          <SectionCard title="Information">
            <div className="space-y-5">
              <Info label="Shipment ID" value={shipment.id} />
              <Info label="Created At" value={formatDate(shipment.createdAt)} />
              {shipment.updatedAt && (
                <Info
                  label="Last Updated"
                  value={formatDate(shipment.updatedAt)}
                />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
