"use client";

import api from "@/lib/axios";
import { RootState } from "@/Redux/store";

import {
  AlertCircle,
  Barcode,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// ============================================================
// TYPES
// ============================================================

interface ScanUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface ScanEvent {
  id: string;
  packageId: string;
  status: string;
  scannedAt: string;
  location?: string | null;
  notes?: string | null;
  scannedBy?: ScanUser | null;
  gilbriceStaff?: ScanUser | null;
}

interface PackageInfo {
  id: string;
  packageCode: string;
  status: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    status: string;
    partnerId: string;
  };
}

interface HistoryResponse {
  package: PackageInfo;
  scanEvents: ScanEvent[];
}

// ============================================================
// STATUS ORDER
// ============================================================

const STATUS_ORDER = [
  "BOOKED",
  "RECEIVED",
  "WEIGHED",
  "MANIFESTED",
  "LOADED",
  "DEPARTED",
  "ARRIVED",
  "READY_FOR_PICKUP",
  "DELIVERED",
];

// ============================================================
// HELPERS
// ============================================================

const formatStatus = (status?: string) => {
  if (!status) return "-";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusClass = (status?: string) => {
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

const getStatusIconClass = (status?: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-600";

    case "CANCELLED":
      return "bg-red-100 text-red-600";

    case "DEPARTED":
    case "LOADED":
      return "bg-blue-100 text-blue-600";

    case "ARRIVED":
    case "READY_FOR_PICKUP":
      return "bg-purple-100 text-purple-600";

    default:
      return "bg-amber-100 text-amber-600";
  }
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const getScannedBy = (event: ScanEvent) => {
  return event.scannedBy || event.gilbriceStaff || null;
};

// ============================================================
// COMPONENT
// ============================================================

const PackageScanHistory = () => {
  const params = useParams();

  const user = useSelector((state: RootState) => state.auth.user);

  const routePartnerId =
    typeof params?.partnerId === "string"
      ? params.partnerId
      : Array.isArray(params?.partnerId)
        ? params.partnerId[0]
        : "";

  const partnerId = routePartnerId || user?.partnerId || null;

  // ==========================================================
  // STATE
  // ==========================================================

  const inputRef = useRef<HTMLInputElement>(null);

  const [packageCode, setPackageCode] = useState("");

  const [history, setHistory] = useState<HistoryResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // AUTO FOCUS
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // ==========================================================
  // FOCUS INPUT
  // ==========================================================

  const focusScanner = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ==========================================================
  // FIND PACKAGE
  // ==========================================================

  const findPackage = async (codeOverride?: string) => {
    const code = (codeOverride ?? packageCode).trim();

    if (!code) {
      toast.error("Enter or scan a package code");

      focusScanner();

      return;
    }

    try {
      setLoading(true);
      setError("");
      setHistory(null);

      // ------------------------------------------------------
      // STEP 1
      // Find package by package code
      // ------------------------------------------------------

      const query = partnerId
        ? `?partnerId=${encodeURIComponent(partnerId)}`
        : "";

      const packageResponse = await api.get(
        `/api/v1/packagescan/code/${encodeURIComponent(code)}${query}`,
      );

      const packageData = packageResponse.data.data as PackageInfo;

      // ------------------------------------------------------
      // STEP 2
      // Get complete scan history
      // ------------------------------------------------------

      const historyQuery = partnerId
        ? `?partnerId=${encodeURIComponent(partnerId)}`
        : "";

      const historyResponse = await api.get(
        `/api/v1/packagescan/${packageData.id}/history${historyQuery}`,
      );

      const data = historyResponse.data.data as HistoryResponse;

      setHistory(data);

      toast.success("Package scan history loaded");
    } catch (err: any) {
      console.error("Package history error:", err);

      const message = err?.response?.data?.message || "Package not found";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);

      focusScanner();
    }
  };

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    await findPackage();
  };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const clearHistory = () => {
    setPackageCode("");
    setHistory(null);
    setError("");

    focusScanner();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
              <History size={22} className="text-secondary" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Package Scan History
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Search a package to view its complete scan history.
              </p>
            </div>
          </div>

          {history && (
            <button
              type="button"
              onClick={clearHistory}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                text-gray-600
                hover:bg-gray-50
                hover:text-gray-900
                transition
              "
            >
              <RefreshCw size={15} />
              New Search
            </button>
          )}
        </div>

        {/* ====================================================
            SEARCH CARD
        ==================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Barcode size={18} className="text-gray-500" />

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Find Package
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Scan barcode or enter package code manually.
                </p>
              </div>
            </div>

            {/* INPUT */}

            <div className="relative">
              <Barcode
                size={20}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                ref={inputRef}
                value={packageCode}
                onChange={(e) => {
                  setPackageCode(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Scan barcode or enter package code..."
                autoComplete="off"
                autoFocus
                className="
                  w-full
                  h-14
                  rounded-xl
                  border
                  border-gray-200
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

              {packageCode && !loading && (
                <button
                  type="button"
                  onClick={clearHistory}
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
                onClick={() => findPackage()}
                disabled={loading || !packageCode.trim()}
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
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Search
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2">
              <Barcode size={14} className="text-gray-400 mt-0.5 shrink-0" />

              <p className="text-xs leading-5 text-gray-400">
                USB/Bluetooth barcode scanners work like a keyboard. Keep this
                field focused and scan the package barcode.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
            bg-red-50
            border
            border-red-200
            rounded-2xl
            p-4
            flex
            items-start
            gap-3
          "
          >
            <AlertCircle size={20} className="text-red-500 mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Package not found
              </p>

              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ====================================================
            PACKAGE INFORMATION
        ==================================================== */}

        {history && (
          <>
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Package size={18} className="text-gray-500" />

                  <h2 className="text-sm font-semibold text-gray-900">
                    Package Information
                  </h2>
                </div>

                <div
                  className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-4
                  gap-4
                "
                >
                  {/* PACKAGE CODE */}

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Barcode size={15} className="text-gray-400" />

                      <span className="text-xs text-gray-400">
                        Package Code
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900 break-all">
                      {history.package.packageCode}
                    </p>
                  </div>

                  {/* TRACKING */}

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={15} className="text-gray-400" />

                      <span className="text-xs text-gray-400">
                        Tracking Number
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900 break-all">
                      {history.package.shipment?.trackingNumber || "-"}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={15} className="text-gray-400" />

                      <span className="text-xs text-gray-400">
                        Current Status
                      </span>
                    </div>

                    <span
                      className={`
                        inline-flex
                        items-center
                        px-2.5
                        py-1
                        rounded-lg
                        border
                        text-xs
                        font-semibold
                        ${getStatusClass(history.package.status)}
                      `}
                    >
                      {formatStatus(history.package.status)}
                    </span>
                  </div>

                  {/* TOTAL SCANS */}

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <History size={15} className="text-gray-400" />

                      <span className="text-xs text-gray-400">Total Scans</span>
                    </div>

                    <p className="text-sm font-bold text-gray-900">
                      {history.scanEvents.length}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                SCAN TIMELINE
            ================================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-gray-500" />

                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Scan Timeline
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Complete package movement history
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-gray-400">
                    {history.scanEvents.length} events
                  </span>
                </div>

                {/* EMPTY */}

                {history.scanEvents.length === 0 ? (
                  <div
                    className="
                    py-14
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                  >
                    <div
                      className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      mb-4
                    "
                    >
                      <History size={24} className="text-gray-400" />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No scan history
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      This package has not been scanned yet.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* VERTICAL LINE */}

                    <div
                      className="
                      absolute
                      left-[20px]
                      top-5
                      bottom-5
                      w-px
                      bg-gray-200
                    "
                    />

                    <div className="space-y-7">
                      {history.scanEvents.map((event, index) => {
                        const scannedBy = getScannedBy(event);

                        const isLatest = index === 0;

                        return (
                          <div key={event.id} className="relative flex gap-4">
                            {/* ICON */}

                            <div
                              className={`
                                  relative
                                  z-10
                                  w-10
                                  h-10
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  shrink-0
                                  ring-4
                                  ring-white
                                  ${getStatusIconClass(event.status)}
                                `}
                            >
                              {event.status === "DELIVERED" ? (
                                <CheckCircle2 size={18} />
                              ) : event.status === "CANCELLED" ? (
                                <X size={18} />
                              ) : (
                                <Package size={17} />
                              )}
                            </div>

                            {/* CONTENT */}

                            <div
                              className="
                                flex-1
                                min-w-0
                                pb-1
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-col
                                  sm:flex-row
                                  sm:items-start
                                  sm:justify-between
                                  gap-2
                                "
                              >
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`
                                          inline-flex
                                          items-center
                                          px-2.5
                                          py-1
                                          rounded-lg
                                          border
                                          text-xs
                                          font-semibold
                                          ${getStatusClass(event.status)}
                                        `}
                                    >
                                      {formatStatus(event.status)}
                                    </span>

                                    {isLatest && (
                                      <span
                                        className="
                                          text-[10px]
                                          font-semibold
                                          uppercase
                                          tracking-wide
                                          text-secondary
                                          bg-secondary/10
                                          px-2
                                          py-1
                                          rounded-md
                                        "
                                      >
                                        Latest
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                    text-xs
                                    text-gray-400
                                    shrink-0
                                  "
                                >
                                  <Clock size={13} />

                                  {formatDate(event.scannedAt)}
                                </div>
                              </div>

                              {/* DETAILS */}

                              <div
                                className="
                                  mt-3
                                  rounded-xl
                                  border
                                  border-gray-100
                                  bg-gray-50
                                  p-3.5
                                "
                              >
                                <div
                                  className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-3
                                  "
                                >
                                  {/* LOCATION */}

                                  <div className="flex items-start gap-2">
                                    <MapPin
                                      size={15}
                                      className="
                                          text-gray-400
                                          mt-0.5
                                          shrink-0
                                        "
                                    />

                                    <div className="min-w-0">
                                      <p className="text-[11px] text-gray-400">
                                        Location
                                      </p>

                                      <p className="text-xs font-medium text-gray-700 mt-0.5 break-words">
                                        {event.location ||
                                          "Location not specified"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* USER */}

                                  <div className="flex items-start gap-2">
                                    <User
                                      size={15}
                                      className="
                                          text-gray-400
                                          mt-0.5
                                          shrink-0
                                        "
                                    />

                                    <div className="min-w-0">
                                      <p className="text-[11px] text-gray-400">
                                        Scanned By
                                      </p>

                                      <p className="text-xs font-medium text-gray-700 mt-0.5 break-words">
                                        {scannedBy?.fullName || "Unknown user"}
                                      </p>

                                      {scannedBy?.role && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                          {formatStatus(scannedBy.role)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* NOTES */}

                                {event.notes && (
                                  <div
                                    className="
                                      mt-3
                                      pt-3
                                      border-t
                                      border-gray-200
                                      flex
                                      items-start
                                      gap-2
                                    "
                                  >
                                    <FileText
                                      size={14}
                                      className="
                                          text-gray-400
                                          mt-0.5
                                          shrink-0
                                        "
                                    />

                                    <div>
                                      <p className="text-[11px] text-gray-400">
                                        Notes
                                      </p>

                                      <p
                                        className="
                                          text-xs
                                          text-gray-600
                                          mt-0.5
                                          leading-5
                                        "
                                      >
                                        {event.notes}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ====================================================
            INITIAL STATE
        ==================================================== */}

        {!history && !loading && !error && (
          <div
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-sm
              py-16
              px-6
              text-center
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-secondary/10
                flex
                items-center
                justify-center
                mx-auto
                mb-4
              "
            >
              <Search size={28} className="text-secondary" />
            </div>

            <h3 className="text-sm font-semibold text-gray-800">
              Search for a package
            </h3>

            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Scan a package barcode or enter the package code above to view its
              complete movement history.
            </p>
          </div>
        )}

        {/* ====================================================
            FOOTER INFO
        ==================================================== */}

        <div
          className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
          px-1
        "
        >
          <div className="flex items-center gap-2">
            <Barcode size={14} className="text-gray-400" />

            <span className="text-xs text-gray-400">Barcode scanner ready</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={13} />
            <span>History is stored permanently for each scan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageScanHistory;
