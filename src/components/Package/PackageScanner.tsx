"use client";

import api from "@/lib/axios";
import { formatDateTimeUS } from "@/lib/date";
import { getTimeZoneByLocation } from "@/lib/timezone";
import {
  AlertCircle,
  Barcode,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ScanLine,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   TYPES
============================================================ */

interface ScanEvent {
  id: string;
  scannedAt: string;
  location?: string | null;
  status: string;
  notes?: string | null;

  scannedBy?: {
    id: string;
    fullName: string;
    email?: string | null;
    role?: string;
  } | null;

  gilbriceStaff?: {
    id: string;
    fullName: string;
    email?: string | null;
    role?: string;
  } | null;
}

interface Customer {
  id: string;
  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
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

  shipment: {
    id: string;
    trackingNumber: string;
    status: string;
    origin: string;
    destination: string;
    customer?: Customer | null;
  };

  scanEvents?: ScanEvent[];
}

/* ============================================================
   STATUS OPTIONS
============================================================ */

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

/* ============================================================
   NEXT STATUS
============================================================ */

const NEXT_STATUS_MAP: Record<string, string> = {
  BOOKED: "RECEIVED",
  RECEIVED: "WEIGHED",
  WEIGHED: "MANIFESTED",
  MANIFESTED: "LOADED",
  LOADED: "DEPARTED",
  DEPARTED: "ARRIVED",
  ARRIVED: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "DELIVERED",
};

/* ============================================================
   HELPERS
============================================================ */

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "DEPARTED":
    case "LOADED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "ARRIVED":
    case "READY_FOR_PICKUP":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "RECEIVED":
    case "WEIGHED":
    case "MANIFESTED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "BOOKED":
      return "bg-gray-50 text-gray-700 border-gray-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

/* ============================================================
   COMPONENT
============================================================ */

const PackageScanner = () => {
  const params = useParams();

  /*
   * Route:
   * /partners/[partnerId]/scanner
   *
   * তাই partnerId URL থেকেই নেওয়া হচ্ছে।
   */
  const routePartnerId = params?.partnerId;

  const partnerId =
    typeof routePartnerId === "string"
      ? routePartnerId
      : Array.isArray(routePartnerId)
        ? routePartnerId[0]
        : "";

  const inputRef = useRef<HTMLInputElement>(null);

  const [packageCode, setPackageCode] = useState("");
  const [status, setStatus] = useState("RECEIVED");

  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [packageData, setPackageData] = useState<PackageData | null>(null);

  const [loadingPackage, setLoadingPackage] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [error, setError] = useState("");

  /* ============================================================
     AUTO FOCUS
  ============================================================ */

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  /* ============================================================
     KEEP INPUT FOCUSED
  ============================================================ */

  const focusScanner = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* ============================================================
     SCAN PACKAGE API
  ============================================================ */

  const scanPackage = async (
    data: PackageData,
    nextStatus: string,
  ): Promise<boolean> => {
    if (!partnerId) {
      toast.error("Partner information is missing");
      return false;
    }

    try {
      setScanning(true);

      const res = await api.post("/api/v1/packagescan", {
        packageCode: data.packageCode,
        status: nextStatus,

        ...(location.trim() && {
          location: location.trim(),
        }),

        ...(notes.trim() && {
          notes: notes.trim(),
        }),

        partnerId,
      });

      const result = res.data.data;

      const updatedPackage: PackageData = {
        ...data,
        status: result.package.status,
        scanEvents: [result.scanEvent, ...(data.scanEvents || [])],
      };

      setPackageData(updatedPackage);

      toast.success(
        `Package ${data.packageCode} → ${formatStatus(nextStatus)}`,
      );

      setStatus(NEXT_STATUS_MAP[result.package.status] || "");

      setNotes("");

      return true;
    } catch (err: any) {
      console.error("Scan package error:", err);

      const message = err?.response?.data?.message || "Failed to scan package";

      toast.error(message);

      return false;
    } finally {
      setScanning(false);
    }
  };

  /* ============================================================
     FIND PACKAGE
  ============================================================ */

  const findPackage = async (
    codeOverride?: string,
    autoScan = true,
  ): Promise<PackageData | null> => {
    const code = (codeOverride ?? packageCode).trim();

    if (!code) {
      toast.error("Enter or scan a package code");
      focusScanner();
      return null;
    }

    if (!partnerId) {
      setError("Partner information is missing");
      toast.error("Partner information is missing");
      return null;
    }

    try {
      setLoadingPackage(true);
      setError("");

      /*
       * Correct backend route:
       *
       * GET /api/v1/packagescan/code/:packageCode
       */
      const res = await api.get(
        `/api/v1/packagescan/code/${encodeURIComponent(code)}?partnerId=${encodeURIComponent(
          partnerId,
        )}`,
      );

      const data: PackageData = res.data.data;

      setPackageData(data);

      /*
       * Current package status থেকে next status বের করা।
       */
      const nextStatus = NEXT_STATUS_MAP[data.status];

      if (!nextStatus) {
        setStatus("");
      } else {
        setStatus(nextStatus);
      }

      /*
       * ========================================================
       * IMPORTANT
       * ========================================================
       *
       * Barcode scanner একবার scan করলে সাধারণত শেষে Enter দেয়।
       *
       * তাই package পাওয়ার সাথে সাথেই autoScan=true হলে
       * পরের status-এ scan/update হবে।
       */
      if (autoScan && nextStatus) {
        await scanPackage(data, nextStatus);
      } else if (!nextStatus) {
        if (data.status === "DELIVERED") {
          toast.error("This package has already been delivered");
        } else if (data.status === "CANCELLED") {
          toast.error("This package has been cancelled");
        } else {
          toast.error("No next status available");
        }
      }

      return data;
    } catch (err: any) {
      console.error("Find package error:", err);

      setPackageData(null);

      const message = err?.response?.data?.message || "Package not found";

      setError(message);

      toast.error(message);

      return null;
    } finally {
      setLoadingPackage(false);

      focusScanner();
    }
  };

  /* ============================================================
     MANUAL CONFIRM SCAN
  ============================================================ */

  const handleManualScan = async () => {
    if (!packageData) {
      await findPackage(packageCode, true);
      return;
    }

    if (!status) {
      toast.error("No next status available");
      return;
    }

    await scanPackage(packageData, status);

    focusScanner();
  };

  /* ============================================================
     ENTER KEY
  ============================================================ */

  const handleCodeKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    /*
     * Package already loaded হলে manually scan করবে।
     *
     * সাধারণ barcode scan-এর সময় packageData থাকবে না,
     * তাই findPackage() হবে এবং সেটা autoScan করবে।
     */
    if (packageData) {
      await handleManualScan();
    } else {
      await findPackage(packageCode, true);
    }
  };

  /* ============================================================
     CLEAR
  ============================================================ */

  const clearPackage = () => {
    setPackageData(null);
    setPackageCode("");
    setError("");
    setNotes("");
    setStatus("RECEIVED");

    focusScanner();
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
              <ScanLine size={22} className="text-secondary" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Package Scanner
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Scan packages and automatically update shipment status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>

              <span className="text-xs font-medium text-gray-600">
                Scanner Ready
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            PARTNER INFO
        ====================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-gray-400" />

              <span className="text-gray-400">Scanner Mode</span>

              <span className="font-semibold text-gray-700">Automatic</span>
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <ScanLine size={14} className="text-gray-400" />

              <span className="text-gray-400">Scan Action</span>

              <span className="font-semibold text-gray-700">Find → Update</span>
            </div>
          </div>
        </div>

        {/* ======================================================
            SCANNER CARD
        ====================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            {/* HEADER */}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Scan Package
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Scan a barcode. The package will be found and processed
                  automatically.
                </p>
              </div>

              {packageData && (
                <button
                  type="button"
                  onClick={clearPackage}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  <RotateCcw size={14} />
                  New Scan
                </button>
              )}
            </div>

            {/* INPUT */}

            <div className="relative">
              <Barcode
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                ref={inputRef}
                value={packageCode}
                onChange={(e) => {
                  setPackageCode(e.target.value);
                  setError("");
                }}
                onKeyDown={handleCodeKeyDown}
                disabled={loadingPackage || scanning}
                placeholder="Scan barcode or enter package code..."
                autoComplete="off"
                autoFocus
                className="
                  w-full
                  h-14
                  rounded-xl
                  border border-gray-200
                  bg-white
                  pl-12
                  pr-32
                  text-base
                  font-medium
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-secondary
                  focus:ring-4
                  focus:ring-secondary/10
                  disabled:bg-gray-50
                "
              />

              {packageCode && (
                <button
                  type="button"
                  onClick={clearPackage}
                  className="
                    absolute
                    right-24
                    top-1/2
                    -translate-y-1/2
                    w-8
                    h-8
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => findPackage(packageCode, true)}
                disabled={loadingPackage || scanning || !packageCode.trim()}
                className="
                  absolute
                  right-1.5
                  top-1.5
                  bottom-1.5
                  px-4
                  rounded-lg
                  bg-gray-900
                  text-white
                  text-sm
                  font-semibold
                  flex
                  items-center
                  gap-2
                  hover:bg-gray-800
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loadingPackage || scanning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}

                {loadingPackage ? "Finding" : scanning ? "Scanning" : "Scan"}
              </button>
            </div>

            {/* INFO */}

            <div className="mt-3 flex items-start gap-2">
              <Barcode size={14} className="text-gray-400 mt-0.5 shrink-0" />

              <p className="text-xs leading-5 text-gray-400">
                USB/Bluetooth barcode scanners work like a keyboard. Keep this
                field focused and scan the package barcode. The scanner will
                automatically find and process the package.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Package Not Found
                  </p>

                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* PROCESSING */}

            {(loadingPackage || scanning) && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <Loader2 size={18} className="animate-spin text-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    {loadingPackage
                      ? "Finding package..."
                      : "Processing scan..."}
                  </p>

                  <p className="text-xs text-blue-600 mt-0.5">Please wait.</p>
                </div>
              </div>
            )}
          </div>

          {/* ====================================================
              PACKAGE INFORMATION
          ==================================================== */}

          {packageData && (
            <div className="border-t border-gray-200">
              <div className="p-5 sm:p-6">
                {/* PACKAGE HEADER */}

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Package size={23} className="text-secondary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Package
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-gray-900 break-all">
                        {packageData.packageCode}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {packageData.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-2">Current Status</p>

                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusClass(
                        packageData.status,
                      )}`}
                    >
                      {formatStatus(packageData.status)}
                    </span>
                  </div>
                </div>

                {/* DETAILS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">Tracking Number</p>

                    <p className="mt-1 text-sm font-bold text-gray-900 break-all">
                      {packageData.shipment.trackingNumber}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">Route</p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span className="truncate">
                        {packageData.shipment.origin}
                      </span>

                      <span className="text-gray-400 shrink-0">→</span>

                      <span className="truncate">
                        {packageData.shipment.destination}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">Package Weight</p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {Number(packageData.weightKg).toFixed(2)} KG
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">Dimensions</p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {packageData.lengthCm &&
                      packageData.widthCm &&
                      packageData.heightCm
                        ? `${packageData.lengthCm} × ${packageData.widthCm} × ${packageData.heightCm} cm`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER */}

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Customer Information
                      </h3>

                      <p className="text-xs text-gray-500">
                        Shipment customer details
                      </p>
                    </div>
                  </div>

                  {packageData.shipment.customer ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Full Name</p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {packageData.shipment.customer.fullName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Phone</p>

                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Phone size={13} />

                          {packageData.shipment.customer.phone ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">WhatsApp</p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {packageData.shipment.customer.whatsapp ||
                            "Not available"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No customer information available.
                    </p>
                  )}
                </div>
              </div>

              {/* ==================================================
                  SCAN FORM
              ================================================== */}

              <div className="border-t border-gray-200 bg-gray-50/70 p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Scan Details
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    The next valid status is selected automatically. You can
                    optionally add location and notes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* STATUS */}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Next Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={scanning}
                      className="
                        w-full
                        h-11
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        text-gray-800
                        outline-none
                        focus:border-secondary
                        focus:ring-2
                        focus:ring-secondary/10
                        disabled:bg-gray-100
                      "
                    >
                      {!status && <option value="">No next status</option>}

                      {STATUS_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {formatStatus(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LOCATION */}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Scan Location
                    </label>

                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={scanning}
                        placeholder="e.g. Reynoldsburg Hub"
                        className="
                          w-full
                          h-11
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          pl-10
                          pr-3
                          text-sm
                          outline-none
                          focus:border-secondary
                          focus:ring-2
                          focus:ring-secondary/10
                          disabled:bg-gray-100
                        "
                      />
                    </div>
                  </div>

                  {/* NOTES */}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Notes
                    </label>

                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={scanning}
                      placeholder="Optional scan note"
                      className="
                        w-full
                        h-11
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-3
                        text-sm
                        outline-none
                        focus:border-secondary
                        focus:ring-2
                        focus:ring-secondary/10
                        disabled:bg-gray-100
                      "
                    />
                  </div>
                </div>

                {/* MANUAL ACTION */}

                <button
                  type="button"
                  onClick={handleManualScan}
                  disabled={
                    scanning ||
                    !status ||
                    packageData.status === "DELIVERED" ||
                    packageData.status === "CANCELLED"
                  }
                  className="
                    mt-5
                    w-full
                    h-12
                    rounded-xl
                    bg-secondary
                    text-white
                    text-sm
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:opacity-90
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {scanning ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing Scan...
                    </>
                  ) : (
                    <>
                      <ScanLine size={18} />
                      Confirm Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================
            SCAN HISTORY
        ====================================================== */}

        {packageData && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Clock3 size={18} className="text-gray-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Scan History
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Previous package scan events
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-gray-400">
                  {packageData.scanEvents?.length || 0} events
                </span>
              </div>
            </div>

            {packageData.scanEvents?.length ? (
              <div className="divide-y divide-gray-100">
                {packageData.scanEvents.map((event, index) => {
                  const scannedUser = event.scannedBy || event.gilbriceStaff;

                  return (
                    <div key={event.id} className="px-5 sm:px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            index === 0 ? "bg-emerald-100" : "bg-gray-100"
                          }`}
                        >
                          {index === 0 ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600"
                            />
                          ) : (
                            <Clock3 size={17} className="text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getStatusClass(
                                  event.status,
                                )}`}
                              >
                                {formatStatus(event.status)}
                              </span>

                              {index === 0 && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  LATEST
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-gray-400">
                              {formatDateTimeUS(
                                event.scannedAt,
                                getTimeZoneByLocation(event.location),
                              )}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {event.location && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin size={13} />
                                {event.location}
                              </span>
                            )}

                            {scannedUser && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                <User size={13} />
                                {scannedUser.fullName}
                              </span>
                            )}
                          </div>

                          {event.notes && (
                            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                              <p className="text-xs text-gray-500">
                                {event.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock3 size={24} className="text-gray-300" />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-600">
                  No Scan History
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Scan events will appear here after the package is processed.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ======================================================
            EMPTY STATE / INSTRUCTIONS
        ====================================================== */}

        {!packageData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Barcode size={20} className="text-secondary" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                One Scan
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-gray-500">
                Scan the package barcode once. The system will automatically
                find the package and process the next valid status.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <ScanLine size={20} className="text-secondary" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                USB Barcode Scanner
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-gray-500">
                A USB barcode scanner behaves like a keyboard. Keep the scanner
                field focused and scan normally.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Truck size={20} className="text-secondary" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                Automatic Status
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-gray-500">
                BOOKED → RECEIVED → WEIGHED → MANIFESTED → LOADED → DEPARTED →
                ARRIVED → READY FOR PICKUP → DELIVERED
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageScanner;
