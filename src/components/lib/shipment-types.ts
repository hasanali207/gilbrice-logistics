// ============================================================
// SHIPMENT TYPES
// Mirrors the Prisma schema (ShipmentStatus, ShipmentMode).
// Swap these for `import { ShipmentStatus, ShipmentMode } from "@prisma/client"`
// once this is wired into your API layer.
// ============================================================

export type ShipmentMode = "AIR" | "SEA" | "LAND";

export type ShipmentStatus =
  | "BOOKED"
  | "RECEIVED"
  | "WEIGHED"
  | "MANIFESTED"
  | "LOADED"
  | "DEPARTED"
  | "ARRIVED"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type ShipmentStatusHistoryEntry = {
  id: string;
  status: ShipmentStatus;
  note?: string | null;
  location?: string | null;
  createdAt: string;
};

export type ShipmentCustomer = {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
};

export type Shipment = {
  id: string;
  trackingNumber: string;

  mode: ShipmentMode;
  origin: string;
  destination: string;
  status: ShipmentStatus;

  actualWeightKg: number;
  volumetricWeightKg?: number | null;
  chargeableWeightKg: number;

  wholesaleRatePerKg: number;
  retailRatePerKg: number;

  partnerCost: number;
  customerPrice: number;
  discount: number;
  additionalFees: number;
  finalCustomerAmount: number;

  amountPaidByCustomer: number;
  customerBalance: number;

  createdAt: string;

  customer: ShipmentCustomer;
  statusHistory?: ShipmentStatusHistoryEntry[];
};

export type CreateShipmentInput = {
  customerId: string;
  mode: ShipmentMode;
  origin: string;
  destination: string;
  actualWeightKg: number;
  volumetricWeightKg?: number;
  retailRatePerKg: number;
  discount?: number;
  additionalFees?: number;
};
