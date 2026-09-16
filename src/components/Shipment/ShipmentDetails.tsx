"use client";

import {
  getAllowedNextShipmentStatuses,
  getShipmentStatusClass,
  getShipmentStatusLabel,
} from "@/constants/shipment-status";
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

const MODE_OPTIONS = ["AIR", "SEA"] as const;

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
  packageCode?: string;
  packageNumber?: number;
  description?: string | null;
  weightKg?: number | string;
  lengthCm?: number | string | null;
  widthCm?: number | string | null;
  heightCm?: number | string | null;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  status?: string;
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

  waybillNumber?: string | null;
  carrierId?: string | null;

  carrier: {
    name: string;
    code: string;
  } | null;

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

interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  type: string;
  isActive: boolean;
}

// ============================================================
// HELPERS
// ============================================================

const formatAmount = (value: number | string | null | undefined): string => {
  return Number(value || 0).toLocaleString("en-US", {
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

// ============================================================
// SECTION CARD
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
        <div className="min-w-0">
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
// INFO
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
// PRICE
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

  const params = useParams();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  const shipmentId = params?.id as string;

  const urlPartnerId = searchParams.get("partnerId") || "";

  // ==========================================================
  // PACKAGE MODAL
  // ==========================================================

  const [packagesModalOpen, setPackagesModalOpen] = useState(false);

  // ==========================================================
  // PARTNER
  // ==========================================================

  const [resolvedPartnerId, setResolvedPartnerId] = useState("");

  const partnerId = useMemo(() => {
    return urlPartnerId || resolvedPartnerId;
  }, [urlPartnerId, resolvedPartnerId]);

  const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : "";

  // ==========================================================
  // SHIPMENT
  // ==========================================================

  const [shipment, setShipment] = useState<Shipment | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // EDIT
  // ==========================================================

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================================
  // STATUS
  // ==========================================================

  const [changingStatus, setChangingStatus] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "",
    note: "",
    location: "",
  });

  // ==========================================================
  // CARRIER
  // ==========================================================

  const [carriers, setCarriers] = useState<any[]>([]);

  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  const [waybillNumber, setWaybillNumber] = useState("");

  const [carrierLoading, setCarrierLoading] = useState(false);

  const [carrierSaving, setCarrierSaving] = useState(false);

  const [showCarrierForm, setShowCarrierForm] = useState(false);

  // ==========================================================
  // LOCATIONS
  // ==========================================================

  const [locations, setLocations] = useState<Location[]>([]);

  const [loadingLocations, setLoadingLocations] = useState(false);

  // ==========================================================
  // EDIT FORM
  // ==========================================================

  const [editForm, setEditForm] = useState({
    originId: "",
    destinationId: "",

    actualWeightKg: "",

    lengthCm: "",
    widthCm: "",
    heightCm: "",

    retailRatePerKg: "",

    discount: "",
    additionalFees: "",
  });

  // ==========================================================
  // VOLUMETRIC DIVISOR
  // ==========================================================

  const VOLUMETRIC_DIVISOR = 5000;

  // ==========================================================
  // CALCULATED VOLUMETRIC WEIGHT
  // ==========================================================

  const calculatedVolumetricWeight = useMemo(() => {
    const l = Number(editForm.lengthCm || 0);
    const w = Number(editForm.widthCm || 0);
    const h = Number(editForm.heightCm || 0);

    if (l > 0 && w > 0 && h > 0) {
      return (l * w * h) / VOLUMETRIC_DIVISOR;
    }

    return 0;
  }, [editForm.lengthCm, editForm.widthCm, editForm.heightCm]);

  // ==========================================================
  // AVAILABLE STATUS OPTIONS
  // ==========================================================

  const availableStatusOptions = useMemo(() => {
    return getAllowedNextShipmentStatuses(shipment?.status);
  }, [shipment?.status]);

  // ==========================================================
  // EDITABLE STATUS
  // ==========================================================

  const editableStatuses = ["BOOKED", "RECEIVED", "PROCESSING", "WEIGHED"];

  const canEdit = Boolean(
    shipment && editableStatuses.includes(shipment.status),
  );

  // ==========================================================
  // POPULATE FORM
  // ==========================================================

  const populateForms = (data: Shipment) => {
    const originLocation = locations.find(
      (location) =>
        location.name.trim().toLowerCase() ===
        data.origin?.trim().toLowerCase(),
    );

    const destinationLocation = locations.find(
      (location) =>
        location.name.trim().toLowerCase() ===
        data.destination?.trim().toLowerCase(),
    );

    setEditForm({
      originId: originLocation?.id || "",
      destinationId: destinationLocation?.id || "",

      actualWeightKg:
        data.actualWeightKg !== undefined && data.actualWeightKg !== null
          ? String(data.actualWeightKg)
          : "",

      lengthCm: "",
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
      status: "",
      note: "",
      location: "",
    });
  };

  // ==========================================================
  // FETCH LOCATIONS
  // ==========================================================

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);

      const res = await api.get("/api/v1/locations?isActive=true");

      setLocations(res.data?.data || []);
    } catch (error: any) {
      console.error("Failed to load locations:", error);

      toast.error(error?.response?.data?.message || "Failed to load locations");
    } finally {
      setLoadingLocations(false);
    }
  };

  // ==========================================================
  // FETCH CARRIERS
  // ==========================================================

  const fetchCarriers = async () => {
    try {
      setCarrierLoading(true);

      const res = await api.get("/api/v1/carrier");

      setCarriers(res.data?.data || []);
    } catch (error: any) {
      console.error("Failed to load carriers:", error);

      toast.error(error?.response?.data?.message || "Failed to load carriers");
    } finally {
      setCarrierLoading(false);
    }
  };

  // ==========================================================
  // FETCH SHIPMENT
  // ==========================================================

  const fetchShipment = async (showInitialLoader = false) => {
    if (!shipmentId) return;

    try {
      if (showInitialLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const url = `/api/v1/shipment/${shipmentId}` + query;

      console.log("FETCH SHIPMENT:", url);

      const res = await api.get(url);

      const data: Shipment | undefined = res.data?.data;

      if (!data) {
        throw new Error("Shipment data not found");
      }

      setShipment(data);

      setSelectedCarrierId(data.carrierId || "");

      setWaybillNumber(data.waybillNumber || "");

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

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (!shipmentId) return;

    fetchShipment(true);
    fetchCarriers();
    fetchLocations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId, urlPartnerId]);

  // ==========================================================
  // REPOPULATE FORM WHEN LOCATIONS LOAD
  // ==========================================================

  useEffect(() => {
    if (!shipment) return;
    if (!locations.length) return;

    populateForms(shipment);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // ==========================================================
  // EDIT CHANGE
  // ==========================================================

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================================
  // UPDATE SHIPMENT
  // ==========================================================

  const handleUpdate = async () => {
    if (!shipment) return;

    if (!partnerId) {
      toast.error("Partner information is required to update this shipment");

      return;
    }

    if (!canEdit) {
      toast.error("This shipment can no longer be edited");

      return;
    }

    if (!editForm.originId) {
      toast.error("Origin is required");
      return;
    }

    if (!editForm.destinationId) {
      toast.error("Destination is required");
      return;
    }

    if (editForm.originId === editForm.destinationId) {
      toast.error("Origin and destination cannot be the same");

      return;
    }

    const actualWeight = Number(editForm.actualWeightKg);

    if (!actualWeight || actualWeight <= 0) {
      toast.error("Actual weight must be greater than 0");

      return;
    }

    const volumetricWeight =
      calculatedVolumetricWeight > 0
        ? calculatedVolumetricWeight
        : Number(shipment.volumetricWeightKg || 0);

    const retailRate = Number(editForm.retailRatePerKg);

    if (retailRate < 0) {
      toast.error("Retail rate cannot be negative");

      return;
    }

    const discount = Number(editForm.discount || 0);

    const additionalFees = Number(editForm.additionalFees || 0);

    if (discount < 0) {
      toast.error("Discount cannot be negative");

      return;
    }

    if (additionalFees < 0) {
      toast.error("Additional fees cannot be negative");

      return;
    }

    try {
      setSaving(true);

      // IMPORTANT:
      // Backend UpdateShipmentPayload expects:
      // originId
      // destinationId
      // actualWeightKg
      // volumetricWeightKg
      // retailRatePerKg
      // discount
      // additionalFees
      const payload = {
        originId: editForm.originId,
        destinationId: editForm.destinationId,

        actualWeightKg: actualWeight,

        volumetricWeightKg: volumetricWeight > 0 ? volumetricWeight : undefined,

        retailRatePerKg: retailRate,

        discount,

        additionalFees,
      };

      const url = `/api/v1/shipment/${shipment.id}` + query;

      console.log("UPDATE SHIPMENT:", url, payload);

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

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

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

    const allowedStatuses = getAllowedNextShipmentStatuses(shipment.status);

    if (!allowedStatuses.includes(statusForm.status as any)) {
      toast.error(
        `Cannot change shipment status from ${getShipmentStatusLabel(
          shipment.status,
        )} to ${getShipmentStatusLabel(statusForm.status)}`,
      );

      return;
    }

    try {
      setChangingStatus(true);

      const url = `/api/v1/shipment/${shipment.id}/status` + query;

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
        status: "",
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

  // ==========================================================
  // ATTACH CARRIER
  // ==========================================================

  const handleAttachCarrier = async () => {
    if (!shipment) return;

    if (!partnerId) {
      toast.error("Partner information is required");

      return;
    }

    if (!selectedCarrierId) {
      toast.error("Please select a carrier");

      return;
    }

    try {
      setCarrierSaving(true);

      const url = `/api/v1/shipment/${shipmentId}/carrier` + query;

      console.log("ATTACH CARRIER:", url);

      const res = await api.patch(url, {
        carrierId: selectedCarrierId,
        waybillNumber: waybillNumber.trim() || undefined,
      });

      const updatedShipment: Shipment = res.data?.data;

      if (!updatedShipment) {
        throw new Error("Updated shipment data not found");
      }

      setShipment(updatedShipment);

      setSelectedCarrierId(updatedShipment.carrierId || "");

      setWaybillNumber(updatedShipment.waybillNumber || "");

      setShowCarrierForm(false);

      toast.success("Carrier attached successfully");

      await fetchShipment();
    } catch (error: any) {
      console.error("Failed to attach carrier:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to attach carrier",
      );
    } finally {
      setCarrierSaving(false);
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    if (partnerId) {
      router.push(`${basePath}/partners/${partnerId}/shipments`);

      return;
    }

    router.push(`${basePath}/shipments`);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // NOT FOUND
  // ==========================================================

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

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const customerName =
    shipment.customer?.fullName || shipment.customer?.name || "—";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full max-w-7xl mx-auto py-5 sm:py-7 lg:py-8 px-3 sm:px-5 lg:px-8 space-y-5 sm:space-y-6 lg:space-y-7 overflow-x-hidden">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-6 pb-1 min-w-0">
        <div className="min-w-0">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition mb-5"
          >
            <ArrowLeft size={16} />
            Back to Shipments
          </button>

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-[52px] h-[52px] rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Truck size={24} className="text-secondary" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight break-all">
                  {shipment.trackingNumber}
                </h1>

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getShipmentStatusClass(
                    shipment.status,
                  )}`}
                >
                  {getShipmentStatusLabel(shipment.status)}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1.5">
                Created {formatDate(shipment.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchShipment()}
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
            <Button size="sm" variant="outline" className="min-h-11 rounded-xl">
              <DollarSign size={14} />
              Pay Payments
            </Button>
          </Link>
        </div>
      </div>

      {/* ======================================================
          PARTNER CONTEXT
      ====================================================== */}

      {partnerId && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl px-5 sm:px-6 lg:px-7 py-4 sm:py-5 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-0">
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">
                Partner
              </p>

              <p className="font-semibold text-gray-800 mt-1.5 break-words">
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

            <Info label="Created At" value={formatDate(shipment.createdAt)} />

            <div>
              {shipment.updatedAt && (
                <Info
                  label="Last Updated"
                  value={formatDate(shipment.updatedAt)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          STATUS UPDATE
      ====================================================== */}

      <SectionCard
        title="Update Shipment Status"
        subtitle="Move the shipment to the next allowed operational status."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 min-w-0">
          {/* STATUS */}

          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>

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
              <option value="">
                {availableStatusOptions.length
                  ? "Select next status"
                  : "No next status available"}
              </option>

              {availableStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {getShipmentStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>

            <select
              value={statusForm.location}
              onChange={(e) =>
                setStatusForm((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              disabled={loadingLocations}
              className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
            >
              <option value="">
                {loadingLocations ? "Loading locations..." : "Select location"}
              </option>

              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>
          </div>

          {/* NOTE */}

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

          {/* UPDATE */}

          <div className="flex items-end">
            <button
              onClick={handleStatusChange}
              disabled={
                changingStatus ||
                !statusForm.status ||
                availableStatusOptions.length === 0
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

      {/* ======================================================
          EDIT FORM
      ====================================================== */}

      {editing && canEdit && (
        <SectionCard
          title="Edit Shipment"
          subtitle="Update shipment information while it is still operationally editable."
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
            {/* MODE */}

            <div>
              <label className="text-sm font-medium text-gray-700">Mode</label>

              <select
                value={shipment.mode}
                disabled
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 bg-gray-50 text-gray-600 cursor-not-allowed"
              >
                {MODE_OPTIONS.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-400 mt-1.5">
                Shipment mode is fixed after creation.
              </p>
            </div>

            {/* ORIGIN */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Origin
              </label>

              <select
                value={editForm.originId}
                onChange={(e) => handleEditChange("originId", e.target.value)}
                disabled={loadingLocations}
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              >
                <option value="">
                  {loadingLocations ? "Loading locations..." : "Select origin"}
                </option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINATION */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Destination
              </label>

              <select
                value={editForm.destinationId}
                onChange={(e) =>
                  handleEditChange("destinationId", e.target.value)
                }
                disabled={loadingLocations}
                className="w-full min-w-0 h-11 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mt-1.5 outline-none focus:ring-2 focus:ring-secondary/30 transition bg-white"
              >
                <option value="">
                  {loadingLocations
                    ? "Loading locations..."
                    : "Select destination"}
                </option>

                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            {/* ACTUAL WEIGHT */}

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

            {/* DIMENSIONS */}

            <div className="sm:col-span-2 xl:col-span-3">
              <label className="text-sm font-medium text-gray-700">
                Dimensions (L × W × H in cm)
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
                    Calculated volumetric weight:{" "}
                    <span className="font-semibold text-gray-700">
                      {calculatedVolumetricWeight.toFixed(2)} KG
                    </span>
                  </>
                ) : (
                  <>
                    Current volumetric weight:{" "}
                    <span className="font-semibold text-gray-700">
                      {Number(shipment.volumetricWeightKg || 0).toFixed(2)} KG
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* RETAIL RATE */}

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

            {/* DISCOUNT */}

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

            {/* ADDITIONAL FEES */}

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

          {/* EDIT ACTIONS */}

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
              disabled={saving || loadingLocations}
              className="w-full sm:w-auto bg-secondary text-white rounded-xl px-5 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm transition"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              <Save size={16} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </SectionCard>
      )}

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start min-w-0">
        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="xl:col-span-2 space-y-5 sm:space-y-6 min-w-0">
          {/* PACKAGES */}

          <SectionCard
            title="Packages"
            subtitle="View, add, edit and print labels for packages in this shipment."
            action={
              <button
                type="button"
                onClick={() => setPackagesModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
              >
                <PackageIcon size={16} />
                Manage Packages
              </button>
            }
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 shrink-0">
                <PackageIcon size={22} className="text-gray-600" />
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {shipment.packages?.length || 0}
                </p>

                <p className="text-sm text-gray-500">
                  {shipment.packages?.length === 1 ? "Package" : "Packages"} in
                  this shipment
                </p>
              </div>
            </div>

            {/* PACKAGE STATUS SUMMARY */}

            {shipment.packages && shipment.packages.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(
                      shipment.packages
                        .map((pkg) => pkg.status)
                        .filter(Boolean),
                    ),
                  ).map((status) => {
                    const count =
                      shipment.packages?.filter((pkg) => pkg.status === status)
                        .length || 0;

                    return (
                      <span
                        key={status}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getShipmentStatusClass(
                          status!,
                        )}`}
                      >
                        {getShipmentStatusLabel(status!)}

                        <span>{count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>
          {/* SHIPMENT INFORMATION */}

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

              <Info
                label="Status"
                value={getShipmentStatusLabel(shipment.status)}
              />
            </div>
          </SectionCard>

          {/* CUSTOMER */}

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

          {/* STATUS HISTORY */}

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
                        className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium ${getShipmentStatusClass(
                          history.status,
                        )}`}
                      >
                        {getShipmentStatusLabel(history.status)}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatDate(history.createdAt)}
                      </span>
                    </div>

                    {history.location && (
                      <p className="text-sm text-gray-500 mt-2.5 flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 shrink-0" />

                        <span className="break-words">{history.location}</span>
                      </p>
                    )}

                    {history.note && (
                      <p className="text-sm text-gray-500 mt-1.5 break-words">
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

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <div className="space-y-5 sm:space-y-6 min-w-0">
          {/* PRICING */}

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

          {/* PAYMENT */}

          <SectionCard
            title="Payment"
            action={
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <DollarSign size={18} className="text-gray-400" />
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

          {/* CARRIER INFORMATION */}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Carrier Information
                  </h3>

                  <p className="text-sm text-gray-500">
                    External carrier and waybill details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCarrierForm((prev) => !prev);

                  if (!showCarrierForm) {
                    fetchCarriers();
                  }
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                {shipment.carrier ? "Change Carrier" : "Assign Carrier"}
              </button>
            </div>

            {/* CURRENT CARRIER */}

            {shipment.carrier ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Carrier
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {shipment.carrier.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {shipment.carrier.code}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Waybill / AWB
                  </p>

                  <p className="mt-1 font-semibold text-gray-900 break-all">
                    {shipment.waybillNumber || "Not assigned"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Truck className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-2 text-sm font-medium text-gray-700">
                  No carrier assigned
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Assign a carrier and waybill to this shipment.
                </p>
              </div>
            )}

            {/* ATTACH / CHANGE FORM */}

            {showCarrierForm && (
              <div className="mt-5 border-t pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* CARRIER */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Carrier
                    </label>

                    <select
                      value={selectedCarrierId}
                      onChange={(e) => setSelectedCarrierId(e.target.value)}
                      disabled={carrierLoading || carrierSaving}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30 bg-white"
                    >
                      <option value="">
                        {carrierLoading
                          ? "Loading carriers..."
                          : "Select carrier"}
                      </option>

                      {carriers.map((carrier) => (
                        <option key={carrier.id} value={carrier.id}>
                          {carrier.name} ({carrier.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WAYBILL */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Waybill / AWB Number
                    </label>

                    <input
                      type="text"
                      value={waybillNumber}
                      onChange={(e) => setWaybillNumber(e.target.value)}
                      disabled={carrierSaving}
                      placeholder="Enter carrier waybill number"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>

                {/* CARRIER ACTIONS */}

                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCarrierForm(false)}
                    disabled={carrierSaving}
                    className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAttachCarrier}
                    disabled={carrierSaving || !selectedCarrierId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {carrierSaving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {carrierSaving
                      ? "Saving..."
                      : shipment.carrier
                        ? "Update Carrier"
                        : "Assign Carrier"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          PACKAGES MODAL
      ====================================================== */}

      {packagesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setPackagesModalOpen(false)}
          />

          {/* MODAL */}

          <div className="relative flex w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipment Packages
                </h2>

                <p className="text-sm text-gray-500 mt-0.5 break-all">
                  {shipment.trackingNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPackagesModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto overflow-x-hidden p-3 sm:p-6">
              <ShipmentPackages
                shipmentId={shipment.id}
                partnerId={partnerId}
                shipmentStatus={shipment.status}
                trackingNumber={shipment.trackingNumber}
                onPackagesChanged={fetchShipment}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetails;
