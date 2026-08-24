export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_BANKING"
  | "CARD"
  | "ONLINE_GATEWAY"
  | "CHEQUE"
  | "STRIPE";

export type PaymentStatusT =
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "REFUNDED"
  | "VOIDED";

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

export interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix: string;
  logoUrl?: string | null;
  isActive?: boolean;
  creditLimit?: string | number | null;
}

export interface ICustomer {
  id: string;
  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

export interface IShipment {
  id: string;
  trackingNumber: string;
  partnerId: string;
  status: ShipmentStatus;
  finalCustomerAmount: string | number;
  amountPaidByCustomer: string | number;
  customerBalance: string | number;
  partner?: IPartner;
  customer?: ICustomer;
  partnerCost?: string | number;
}

export interface IRecordedBy {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface IPayment {
  id: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatusT;
  transactionRef?: string | null;
  paidAt: string;
  isVoided: boolean;
  voidReason?: string | null;
  shipment: IShipment;
  recordedBy?: IRecordedBy | null;
}

export interface IPartnerLedgerEntry {
  id: string;
  partnerId: string;
  description: string;
  debit: string | number;
  credit: string | number;
  runningBalance: string | number;
  createdAt: string;
  // Present on GET /api/v1/partner-ledger (all-partners list, staff view).
  // NOT present on GET /api/v1/partner-ledger/:partnerId (single partner
  // view) - that endpoint returns { partner, summary, entries } instead.
  partner?: {
    id: string;
    companyName: string;
    trackingPrefix: string;
  } | null;
  shipmentId?: string | null;
  shipment?: {
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    partnerCost: string | number;
  } | null;
}

export interface IPartnerSettlement {
  id: string;
  partnerId: string;
  amount: string | number;
  method: PaymentMethod;
  transactionRef?: string | null;
  status: PaymentStatusT;
  note?: string | null;
  settledAt: string;
  partner?: IPartner;
  recordedBy?: { id: string; fullName: string; email: string } | null;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "CARD",
  "CHEQUE",
  "STRIPE",
];

export const formatAmount = (amount: string | number) =>
  Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const formatDateOnly = (date: string) =>
  new Date(date).toLocaleDateString("en-BD", {
    dateStyle: "medium",
  });
