"use client";

import { getShipmentStatusLabel } from "@/constants/shipment-status";
import api from "@/lib/axios";
import {
  AlertCircle,
  ArrowRight,
  Box,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  MapPin,
  Package,
  Plane,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TrackingEvent {
  id?: string;
  status?: string;
  note?: string | null;
  description?: string | null;
  location?: string | null;
  scannedAt?: string;
  createdAt?: string;
}

interface PackageItem {
  id?: string;
  weightKg?: number;
  actualWeightKg?: number;
  volumetricWeightKg?: number;
  [key: string]: any;
}

interface TrackingData {
  id?: string;
  trackingNumber: string;
  status: string;

  route?: {
    origin?: string;
    destination?: string;
    mode?: string;
  };

  origin?: string;
  destination?: string;
  mode?: string;

  actualWeightKg?: number;
  volumetricWeightKg?: number;

  customer?: {
    name?: string;
    fullName?: string;
    phone?: string;
  };

  packageSummary?: {
    totalPackages?: number;
    packages?: PackageItem[];
  };

  timeline?: TrackingEvent[];
  trackingEvents?: TrackingEvent[];
  events?: TrackingEvent[];

  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================
   CUSTOMER-FACING STATUS STEPS

   Backend has more detailed internal statuses.
   Customer sees simplified shipment progress.
============================================================ */

const STATUS_STEPS = [
  {
    key: "BOOKED",
    label: "Booked",
    icon: Package,
  },
  {
    key: "RECEIVED",
    label: "Received",
    icon: Box,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    icon: Clock3,
  },
  {
    key: "IN_TRANSIT",
    label: "In Transit",
    icon: Plane,
  },
  {
    key: "ARRIVED",
    label: "Arrived",
    icon: MapPin,
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle2,
  },
];

/* ============================================================
   HELPERS
============================================================ */

const normalizeStatus = (status?: string) => {
  if (!status) return "";

  return status.toUpperCase().replace(/\s+/g, "_").replace(/-/g, "_");
};

/* ============================================================
   INTERNAL STATUS → CUSTOMER TRACKING STAGE

   Backend:
   PROCESSING
   WEIGHED
   MANIFESTED
   LOADED
        ↓
   Customer:
   PROCESSING

   Backend:
   DEPARTED
        ↓
   Customer:
   IN_TRANSIT

   Backend:
   ARRIVED
   LOCAL_DISTRIBUTION
   READY_FOR_PICKUP
        ↓
   Customer:
   ARRIVED
============================================================ */

const getTrackingStep = (status?: string) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "BOOKED":
      return "BOOKED";

    case "RECEIVED":
      return "RECEIVED";

    case "PROCESSING":
    case "WEIGHED":
    case "MANIFESTED":
    case "LOADED":
      return "PROCESSING";

    case "DEPARTED":
      return "IN_TRANSIT";

    case "ARRIVED":
    case "LOCAL_DISTRIBUTION":
    case "READY_FOR_PICKUP":
      return "ARRIVED";

    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";

    case "DELIVERED":
      return "DELIVERED";

    default:
      return "";
  }
};

/* ============================================================
   STATUS INDEX
============================================================ */

const getStatusIndex = (status?: string) => {
  const normalized = normalizeStatus(status);

  return STATUS_STEPS.findIndex((step) => step.key === normalized);
};

/* ============================================================
   DATE FORMAT
============================================================ */

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between gap-5 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-sm font-semibold text-foreground text-right break-words">
        {value || "—"}
      </span>
    </div>
  );
};

/* ============================================================
   TRACKING PAGE
============================================================ */

const TrackingPage = () => {
  const params = useParams();

  const trackingNumber =
    typeof params.trackingNumber === "string"
      ? params.trackingNumber
      : Array.isArray(params.trackingNumber)
        ? params.trackingNumber[0]
        : "";

  const [tracking, setTracking] = useState<TrackingData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     FETCH TRACKING
  ========================================================== */

  useEffect(() => {
    if (!trackingNumber) {
      setLoading(false);
      setError("Tracking number is missing.");
      return;
    }

    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError("");

        const decodedTrackingNumber = decodeURIComponent(trackingNumber);

        const res = await api.get(
          `/api/v1/tracking/${encodeURIComponent(decodedTrackingNumber)}`,
        );

        const data = res.data?.data ?? res.data;

        setTracking(data);
      } catch (err: any) {
        console.error("Tracking error:", err);

        setError(
          err?.response?.data?.message || "Unable to find this shipment.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [trackingNumber]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-lg bg-muted" />

            <div className="h-28 rounded-2xl bg-card border" />

            <div className="h-72 rounded-2xl bg-card border" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-52 rounded-2xl bg-card border" />

              <div className="h-52 rounded-2xl bg-card border" />
            </div>

            <div className="h-80 rounded-2xl bg-card border" />
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !tracking) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
              <AlertCircle className="text-red-600" size={30} />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Shipment Not Found
            </h1>

            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {error ||
                "We could not find a shipment with this tracking number."}
            </p>

            {trackingNumber && (
              <div className="mt-6 px-4 py-3 rounded-xl bg-muted text-sm font-semibold">
                {trackingNumber}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     NORMALIZED DATA
  ========================================================== */

  const status = normalizeStatus(tracking.status);

  /*
   * Convert backend internal status
   * to simplified customer-facing status.
   */
  const trackingStep = getTrackingStep(status);

  const currentStep = getStatusIndex(trackingStep);

  const origin = tracking.route?.origin || tracking.origin || "—";

  const destination =
    tracking.route?.destination || tracking.destination || "—";

  const mode = tracking.route?.mode || tracking.mode || "—";

  const customerName =
    tracking.customer?.name || tracking.customer?.fullName || "";

  const customerPhone = tracking.customer?.phone || "";

  const events =
    tracking.timeline || tracking.trackingEvents || tracking.events || [];

  const packageCount = tracking.packageSummary?.totalPackages ?? 0;

  const packages = tracking.packageSummary?.packages || [];

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <main className="min-h-screen bg-background">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent blur-3xl" />

          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-14">
          {/* BRAND */}

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Package size={23} />
            </div>

            <div>
              <p className="text-sm text-white/70">Gilbrice Logistics</p>

              <h1 className="text-2xl md:text-3xl font-bold">
                Shipment Tracking
              </h1>
            </div>
          </div>

          {/* TRACKING CARD */}

          <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-5 md:p-6">
            <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
              Tracking Number
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-2xl md:text-3xl font-bold tracking-wide break-all">
                {tracking.trackingNumber}
              </div>

              <div className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                <CircleDot size={16} />

                {getShipmentStatusLabel(tracking.status)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {/* ====================================================
            ROUTE
        ==================================================== */}

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-7">
            <MapPin size={19} className="text-secondary" />

            <h2 className="text-lg font-bold text-foreground">
              Shipment Route
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* ORIGIN */}

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Origin
              </p>

              <p className="text-xl md:text-2xl font-bold text-foreground">
                {origin}
              </p>
            </div>

            {/* ARROW */}

            <div className="hidden md:flex w-12 h-12 rounded-full bg-secondary/10 items-center justify-center">
              <ArrowRight size={21} className="text-secondary" />
            </div>

            {/* DESTINATION */}

            <div className="md:text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Destination
              </p>

              <p className="text-xl md:text-2xl font-bold text-foreground">
                {destination}
              </p>
            </div>
          </div>

          {/* MODE */}

          <div className="mt-7 pt-5 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Shipping Mode</span>

            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-sm font-bold">
              <Plane size={15} />

              {mode}
            </span>
          </div>
        </div>

        {/* ====================================================
            STATUS TRACKER
        ==================================================== */}

        {status !== "CANCELLED" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-8">
              <Truck size={19} className="text-secondary" />

              <h2 className="text-lg font-bold">Shipment Progress</h2>
            </div>

            <div className="relative overflow-x-auto pb-2">
              {/* DESKTOP BASE LINE */}

              <div className="hidden md:block absolute top-6 left-[7%] right-[7%] h-1 bg-muted rounded-full" />

              {/* DESKTOP PROGRESS LINE */}

              {currentStep >= 0 && (
                <div
                  className="hidden md:block absolute top-6 left-[7%] h-1 bg-secondary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (currentStep / (STATUS_STEPS.length - 1)) * 86,
                      86,
                    )}%`,
                  }}
                />
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-5 md:gap-2 relative min-w-[700px] md:min-w-0">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;

                  const completed = currentStep >= index;

                  const active = currentStep === index;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className={`
                            w-12 h-12 rounded-full
                            flex items-center justify-center
                            border-4 border-card
                            transition-all duration-300
                            ${
                              completed
                                ? "bg-secondary text-white"
                                : "bg-muted text-muted-foreground"
                            }
                            ${
                              active ? "ring-4 ring-secondary/20 scale-110" : ""
                            }
                          `}
                      >
                        <Icon size={18} />
                      </div>

                      <p
                        className={`text-xs md:text-sm font-semibold ${
                          completed ? "text-secondary" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            CANCELLED STATUS
        ==================================================== */}

        {status === "CANCELLED" && (
          <div className="bg-card border border-red-200 rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={21} className="text-red-600" />
              </div>

              <div>
                <h2 className="font-bold text-lg text-red-700">
                  Shipment Cancelled
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  This shipment has been cancelled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TOP SUMMARY
        ==================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* STATUS */}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <CircleDot size={18} className="text-secondary" />
            </div>

            <p className="text-xs text-muted-foreground">Current Status</p>

            <p className="font-bold text-sm mt-1">
              {getShipmentStatusLabel(status)}
            </p>
          </div>

          {/* PACKAGES */}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <Package size={18} className="text-secondary" />
            </div>

            <p className="text-xs text-muted-foreground">Total Packages</p>

            <p className="font-bold text-xl mt-1">{packageCount}</p>
          </div>

          {/* MODE */}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <Plane size={18} className="text-secondary" />
            </div>

            <p className="text-xs text-muted-foreground">Shipping Mode</p>

            <p className="font-bold text-sm mt-1">{mode}</p>
          </div>

          {/* EVENTS */}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
              <Clock3 size={18} className="text-secondary" />
            </div>

            <p className="text-xs text-muted-foreground">Tracking Updates</p>

            <p className="font-bold text-xl mt-1">{events.length}</p>
          </div>
        </div>

        {/* ====================================================
            INFO CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* SHIPMENT INFORMATION */}

          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package size={19} className="text-secondary" />

              <h2 className="font-bold text-lg">Shipment Information</h2>
            </div>

            <div>
              <InfoRow
                label="Tracking Number"
                value={tracking.trackingNumber}
              />

              <InfoRow label="Shipping Mode" value={mode} />

              <InfoRow label="Packages" value={String(packageCount)} />

              <InfoRow
                label="Actual Weight"
                value={
                  tracking.actualWeightKg !== undefined
                    ? `${tracking.actualWeightKg} KG`
                    : "—"
                }
              />

              <InfoRow
                label="Volumetric Weight"
                value={
                  tracking.volumetricWeightKg !== undefined
                    ? `${tracking.volumetricWeightKg} KG`
                    : "—"
                }
              />

              <InfoRow
                label="Booked On"
                value={formatDate(tracking.createdAt)}
              />
            </div>
          </div>

          {/* SHIPMENT DETAILS */}

          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={19} className="text-secondary" />

              <h2 className="font-bold text-lg">Shipment Details</h2>
            </div>

            <div>
              <InfoRow
                label="Current Status"
                value={getShipmentStatusLabel(status)}
              />

              <InfoRow label="Origin" value={origin} />

              <InfoRow label="Destination" value={destination} />

              {customerName && (
                <InfoRow label="Customer" value={customerName} />
              )}

              {customerPhone && (
                <InfoRow label="Contact" value={customerPhone} />
              )}

              <InfoRow
                label="Last Updated"
                value={formatDate(tracking.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            PACKAGE SUMMARY
        ==================================================== */}

        {packageCount > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package size={19} className="text-secondary" />

                <h2 className="font-bold text-lg">Package Summary</h2>
              </div>

              <span className="text-sm font-semibold text-muted-foreground">
                {packageCount} {packageCount === 1 ? "Package" : "Packages"}
              </span>
            </div>

            {packages.length > 0 ? (
              <div className="space-y-3">
                {packages.map((pkg, index) => (
                  <div
                    key={pkg.id || index}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Package size={17} className="text-secondary" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Package {index + 1}
                          </p>
                        </div>
                      </div>

                      {(pkg.weightKg !== undefined ||
                        pkg.actualWeightKg !== undefined) && (
                        <span className="text-sm font-semibold">
                          {pkg.weightKg ?? pkg.actualWeightKg} KG
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">
                {packageCount} package
                {packageCount !== 1 ? "s" : ""} associated with this shipment.
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TRACKING HISTORY
        ==================================================== */}

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-7">
            <div className="flex items-center gap-2">
              <Clock3 size={19} className="text-secondary" />

              <h2 className="font-bold text-lg">Tracking History</h2>
            </div>

            <span className="text-xs font-semibold text-muted-foreground">
              {events.length} update
              {events.length !== 1 ? "s" : ""}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="py-10 text-center">
              <Clock3
                size={30}
                className="mx-auto text-muted-foreground mb-3"
              />

              <p className="text-sm text-muted-foreground">
                No tracking updates available yet.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* TIMELINE LINE */}

              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

              <div className="space-y-7">
                {events.map((event, index) => {
                  const eventStatus = normalizeStatus(event.status);

                  const isLatest = index === events.length - 1;

                  const eventDescription = event.note || event.description;

                  return (
                    <div key={event.id || index} className="relative pl-11">
                      {/* DOT */}

                      <div
                        className={`
                          absolute left-0 top-0
                          w-8 h-8 rounded-full
                          flex items-center justify-center
                          ring-4 ring-card
                          ${
                            isLatest
                              ? "bg-secondary text-white"
                              : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        {isLatest ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-current" />
                        )}
                      </div>

                      {/* EVENT CARD */}

                      <div
                        className={`
                          rounded-xl border p-4
                          transition-all
                          ${
                            isLatest
                              ? "border-secondary/30 bg-secondary/5"
                              : "border-border bg-card"
                          }
                        `}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {getShipmentStatusLabel(eventStatus)}
                              </h3>

                              {isLatest && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wide">
                                  Current
                                </span>
                              )}
                            </div>

                            {eventDescription && (
                              <p className="text-sm text-muted-foreground mt-1.5 leading-6">
                                {eventDescription}
                              </p>
                            )}

                            {event.location && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                                <MapPin size={14} />

                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                            <CalendarDays size={14} />

                            {formatDate(event.scannedAt || event.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="text-center mt-8 pb-6 text-sm text-muted-foreground">
          <p>
            Tracking information is updated as your shipment moves through our
            logistics network.
          </p>

          <p className="mt-1 font-medium">Gilbrice Logistics</p>
        </div>
      </section>
    </main>
  );
};

export default TrackingPage;
