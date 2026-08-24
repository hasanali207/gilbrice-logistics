"use client";

import { MethodBadge, PaymentStatusBadge } from "@/components/Payments/Badges";
import api from "@/lib/axios";
import { IPayment, formatAmount, formatDate } from "@/lib/types";
import { RootState } from "@/Redux/store";
import { ArrowLeft, Ban, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   PAGE: /partner/payments/[paymentId]
   "Payment Details" - partner-side payment detail. Void action
   is only shown if the logged-in partner employee's role has
   void permission (e.g. OWNER / MANAGER).
============================================================ */

const VOID_ALLOWED_ROLES = ["OWNER", "MANAGER"];

const PartnerPaymentDetailsPage = () => {
  const params = useParams<{ paymentId: string }>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);

  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const canVoid = VOID_ALLOWED_ROLES.includes(user?.role ?? "");

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/payment/${params.paymentId}`);
      setPayment(res.data?.data ?? null);
    } catch (error: any) {
      console.error("Failed to fetch payment:", error);
      toast.error(error?.response?.data?.message || "Failed to load payment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.paymentId) fetchPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.paymentId]);

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      toast.error("A void reason is required");
      return;
    }

    try {
      setVoiding(true);
      await api.patch(`/api/v1/payment/${params.paymentId}/void`, {
        reason: voidReason.trim(),
      });
      toast.success("Payment voided");
      setVoidOpen(false);
      setVoidReason("");
      fetchPayment();
    } catch (error: any) {
      console.error("Failed to void payment:", error);
      toast.error(error?.response?.data?.message || "Failed to void payment");
    } finally {
      setVoiding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading payment...
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 text-center text-gray-500">
        Payment not found.
      </div>
    );
  }

  const shipmentTotal = Number(payment.shipment.finalCustomerAmount);
  const previouslyPaid =
    Number(payment.shipment.amountPaidByCustomer) - Number(payment.amount);
  const remaining = Number(payment.shipment.customerBalance);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Payment #{payment.id.slice(0, 8).toUpperCase()}
        </h1>
        <PaymentStatusBadge
          status={payment.status}
          isVoided={payment.isVoided}
        />
      </div>

      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <dl className="grid grid-cols-2 gap-y-4 text-sm">
          <dt className="text-gray-500">Amount</dt>
          <dd className="font-semibold text-gray-800">
            $ {formatAmount(payment.amount)}
          </dd>

          <dt className="text-gray-500">Method</dt>
          <dd>
            <MethodBadge method={payment.method} />
          </dd>

          <dt className="text-gray-500">Status</dt>
          <dd>
            <PaymentStatusBadge
              status={payment.status}
              isVoided={payment.isVoided}
            />
          </dd>

          <dt className="text-gray-500">Reference</dt>
          <dd className="text-gray-800">{payment.transactionRef ?? "-"}</dd>

          <dt className="text-gray-500">Paid At</dt>
          <dd className="text-gray-800">{formatDate(payment.paidAt)}</dd>

          {payment.isVoided && (
            <>
              <dt className="text-gray-500">Void Reason</dt>
              <dd className="text-red-600">{payment.voidReason}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Shipment
        </h2>
        <Link
          href={`/partner/shipments/${payment.shipment.id}`}
          className="text-blue-600 hover:underline font-mono text-sm"
        >
          {payment.shipment.trackingNumber}
        </Link>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6 mb-2">
          Customer
        </h2>
        <p className="text-sm text-gray-800">
          {payment.shipment.customer?.fullName ?? "-"}
        </p>

        <div className="grid grid-cols-3 gap-4 text-center mt-6 pt-6 border-t">
          <div>
            <p className="text-xs text-gray-500">Shipment Total</p>
            <p className="font-bold text-gray-800">
              $ {formatAmount(shipmentTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Previously Paid</p>
            <p className="font-bold text-gray-800">
              $ {formatAmount(Math.max(previouslyPaid, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">This Payment</p>
            <p className="font-bold text-green-600">
              $ {formatAmount(payment.amount)}
            </p>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="font-bold text-red-600">$ {formatAmount(remaining)}</p>
        </div>
      </div>

      {canVoid && !payment.isVoided && payment.status === "CONFIRMED" && (
        <div className="flex justify-end">
          <button
            onClick={() => setVoidOpen(true)}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm hover:bg-red-50"
          >
            <Ban size={16} /> Void Payment
          </button>
        </div>
      )}

      {voidOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Void Payment
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This will reverse the payment amount from the shipment balance.
            </p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Reason for voiding this payment"
              className="w-full border rounded-md px-3 py-2 text-sm mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setVoidOpen(false)}
                className="border rounded-md px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={voiding}
                className="bg-red-600 text-white rounded-md px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {voiding ? "Voiding..." : "Void Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPaymentDetailsPage;
