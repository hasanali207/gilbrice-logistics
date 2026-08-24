import type { ShipmentStatus } from "./shipment-types";

// ============================================================
// STATUS FLOW (excludes the terminal CANCELLED branch, which can
// be reached from any non-final status — see ALLOWED_TRANSITIONS)
// ============================================================

export const STATUS_FLOW: ShipmentStatus[] = [
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

// Mirrors `allowedStatusTransitions` in shipment.service.ts — keep in sync.
export const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  BOOKED: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["WEIGHED", "CANCELLED"],
  WEIGHED: ["MANIFESTED", "CANCELLED"],
  MANIFESTED: ["LOADED", "CANCELLED"],
  LOADED: ["DEPARTED", "CANCELLED"],
  DEPARTED: ["ARRIVED"],
  ARRIVED: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

type StatusMeta = {
  label: string;
  short: string;
  /** Tailwind classes for the pill badge */
  badge: string;
  /** Tailwind class for timeline dots / rail fill */
  dot: string;
};

// Three semantic clusters: neutral (booked), processing (warehouse
// handling), in-motion (amber — cargo is physically moving), and the
// two terminal states.
export const STATUS_META: Record<ShipmentStatus, StatusMeta> = {
  BOOKED: {
    label: "Booked",
    short: "Booked",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  RECEIVED: {
    label: "Received at warehouse",
    short: "Received",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  WEIGHED: {
    label: "Weighed & measured",
    short: "Weighed",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  MANIFESTED: {
    label: "Manifested",
    short: "Manifested",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  LOADED: {
    label: "Loaded",
    short: "Loaded",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  DEPARTED: {
    label: "Departed origin",
    short: "Departed",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  ARRIVED: {
    label: "Arrived at destination",
    short: "Arrived",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  READY_FOR_PICKUP: {
    label: "Ready for pickup",
    short: "Ready",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  DELIVERED: {
    label: "Delivered",
    short: "Delivered",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    short: "Cancelled",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export const MODE_LABEL: Record<string, string> = {
  AIR: "Air freight",
  SEA: "Sea freight",
  LAND: "Land freight",
};

// ============================================================
// FORMATTERS
// ============================================================

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const formatWeight = (kg: number) => `${kg.toFixed(2)} kg`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
