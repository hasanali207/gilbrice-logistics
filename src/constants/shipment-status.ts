export const SHIPMENT_STATUSES = [
  "BOOKED",
  "RECEIVED",
  "PROCESSING",
  "WEIGHED",
  "MANIFESTED",
  "LOADED",
  "DEPARTED",
  "ARRIVED",
  "LOCAL_DISTRIBUTION",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  BOOKED: "Booked",
  RECEIVED: "Received",
  PROCESSING: "Processing",
  WEIGHED: "Weighed",
  MANIFESTED: "Manifested",
  LOADED: "Loaded",
  DEPARTED: "In Transit",
  ARRIVED: "Arrived at USA Destination",
  LOCAL_DISTRIBUTION: "Local Distribution",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ALLOWED_STATUS_TRANSITIONS: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  BOOKED: ["RECEIVED", "CANCELLED"],

  RECEIVED: ["PROCESSING", "CANCELLED"],

  PROCESSING: ["WEIGHED", "CANCELLED"],

  WEIGHED: ["MANIFESTED", "CANCELLED"],

  MANIFESTED: ["LOADED", "CANCELLED"],

  LOADED: ["DEPARTED", "CANCELLED"],

  DEPARTED: ["ARRIVED"],

  ARRIVED: ["LOCAL_DISTRIBUTION"],

  LOCAL_DISTRIBUTION: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY"],

  READY_FOR_PICKUP: ["DELIVERED"],

  OUT_FOR_DELIVERY: ["DELIVERED"],

  DELIVERED: [],

  CANCELLED: [],
};

export const SHIPMENT_STATUS_CLASS: Record<ShipmentStatus, string> = {
  BOOKED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  RECEIVED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  PROCESSING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  WEIGHED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  MANIFESTED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

  LOADED: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

  DEPARTED: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

  ARRIVED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

  LOCAL_DISTRIBUTION: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

  READY_FOR_PICKUP: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

  OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",

  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export const getShipmentStatusLabel = (status?: string | null) => {
  if (!status) return "—";

  return (
    SHIPMENT_STATUS_LABELS[status as ShipmentStatus] ||
    status.replaceAll("_", " ")
  );
};

export const getAllowedNextShipmentStatuses = (
  status?: string | null,
): ShipmentStatus[] => {
  if (!status) return [];

  return ALLOWED_STATUS_TRANSITIONS[status as ShipmentStatus] || [];
};

export const getShipmentStatusClass = (status?: string | null) => {
  if (!status) {
    return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  }

  return (
    SHIPMENT_STATUS_CLASS[status as ShipmentStatus] ||
    "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
  );
};
