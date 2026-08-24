"use client";

import { PaymentStatusT } from "@/lib/types";
import { Ban, CheckCircle2, Clock, RefreshCcw, XCircle } from "lucide-react";

export const PaymentStatusBadge = ({
  status,
  isVoided,
}: {
  status: PaymentStatusT;
  isVoided?: boolean;
}) => {
  if (isVoided || status === "VOIDED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <Ban size={12} /> Voided
      </span>
    );
  }

  const map: Record<
    PaymentStatusT,
    { icon: React.ReactNode; classes: string; label: string }
  > = {
    CONFIRMED: {
      icon: <CheckCircle2 size={12} />,
      classes: "bg-green-100 text-green-700",
      label: "Confirmed",
    },
    PENDING: {
      icon: <Clock size={12} />,
      classes: "bg-yellow-100 text-yellow-700",
      label: "Pending",
    },
    FAILED: {
      icon: <XCircle size={12} />,
      classes: "bg-red-100 text-red-700",
      label: "Failed",
    },
    REFUNDED: {
      icon: <RefreshCcw size={12} />,
      classes: "bg-blue-100 text-blue-700",
      label: "Refunded",
    },
    VOIDED: {
      icon: <Ban size={12} />,
      classes: "bg-gray-100 text-gray-500",
      label: "Voided",
    },
  };

  const conf = map[status] ?? map.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${conf.classes}`}
    >
      {conf.icon} {conf.label}
    </span>
  );
};

export const MethodBadge = ({ method }: { method: string }) => {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
      {method.replace(/_/g, " ")}
    </span>
  );
};
