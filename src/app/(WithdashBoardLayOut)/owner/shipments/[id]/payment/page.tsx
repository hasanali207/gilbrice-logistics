"use client";

import StripePaymentForm from "@/components/Payments/StripePaymentForm";
import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { PaymentMethod, formatAmount } from "@/lib/types";
import { RootState } from "@/Redux/store";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/* ============================================================
   MANUAL METHODS
============================================================ */

const MANUAL_METHODS: PaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "CARD",
  "CHEQUE",
];

/* ============================================================
   SUMMARY
============================================================ */

interface IPaymentSummary {
  balance: number;

  isFullyPaid: boolean;

  paymentCount: number;

  shipment: {
    id: string;
    trackingNumber: string;
  };

  totalAmount: number;

  totalPaid: number;

  totalVoided: number;

  voidedPaymentCount: number;
}

/* ============================================================
   PAGE
============================================================ */

const ReceiveCustomerPaymentPage = () => {
  const params = useParams<{ id: string }>();

  const router = useRouter();

  const [summary, setSummary] = useState<IPaymentSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);

  const [stripeLoading, setStripeLoading] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [amount, setAmount] = useState("");

  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const [transactionRef, setTransactionRef] = useState("");

  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));

  const [note, setNote] = useState("");

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  /* ============================================================
     FETCH SHIPMENT
  ============================================================ */

  const fetchShipment = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/v1/payment/shipment/${params.id}/summary`,
      );

      setSummary(res.data?.data ?? null);
    } catch (error: any) {
      console.error("Failed to fetch shipment:", error);

      toast.error(error?.response?.data?.message || "Failed to load shipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchShipment();
    }
  }, [params.id]);

  /* ============================================================
     VALUES
  ============================================================ */

  const outstanding =
    summary && Number.isFinite(Number(summary.balance))
      ? Number(summary.balance)
      : 0;

  const totalAmount =
    summary && Number.isFinite(Number(summary.totalAmount))
      ? Number(summary.totalAmount)
      : 0;

  const totalPaid =
    summary && Number.isFinite(Number(summary.totalPaid))
      ? Number(summary.totalPaid)
      : 0;

  /* ============================================================
     CREATE STRIPE PAYMENT INTENT
  ============================================================ */

  const handleStripePayment = async () => {
    if (!params.id) return;

    if (outstanding <= 0) {
      toast.error("This shipment has no outstanding balance.");

      return;
    }

    try {
      setStripeLoading(true);

      /*
       * Backend calculates the real outstanding amount.
       *
       * We only send shipmentId.
       */

      const res = await api.post("/api/v1/payment/create-payment-intent", {
        shipmentId: params.id,
      });

      const data = res.data?.data ?? res.data;

      if (!data?.clientSecret) {
        throw new Error("Stripe client secret was not returned.");
      }

      setClientSecret(data.clientSecret);

      setPaymentIntentId(data.paymentIntentId ?? null);
    } catch (error: any) {
      console.error("Failed to create Stripe payment intent:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start Stripe payment",
      );
    } finally {
      setStripeLoading(false);
    }
  };

  /* ============================================================
     MANUAL PAYMENT
  ============================================================ */

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid payment amount");

      return;
    }

    if (numericAmount > outstanding) {
      toast.error(
        `Payment amount cannot exceed outstanding balance of $${formatAmount(
          outstanding,
        )}`,
      );

      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/v1/payment", {
        shipmentId: params.id,

        amount: numericAmount,

        method,

        transactionRef: transactionRef.trim() || undefined,

        paidAt,

        note: note.trim() || undefined,
      });

      toast.success("Payment received successfully");

      setSuccess(true);
    } catch (error: any) {
      console.error("Failed to record payment:", error);

      toast.error(error?.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading shipment...
        </div>
      </div>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (!summary) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">
        Shipment not found.
      </div>
    );
  }

  /* ============================================================
     SUCCESS
  ============================================================ */

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Payment Received
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          The payment has been recorded against{" "}
          {summary.shipment?.trackingNumber}.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.push(`${basePath}/shipments`)}
            className="bg-secondary text-white rounded-lg px-4 py-2 text-sm hover:opacity-90"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     STRIPE OPTIONS
  ============================================================ */

  const stripeOptions = clientSecret
    ? {
        clientSecret,

        appearance: {
          theme: "stripe" as const,

          variables: {
            borderRadius: "8px",
          },
        },
      }
    : undefined;

  /* ============================================================
     STRIPE SUCCESS
  ============================================================ */

  const handleStripeSuccess = async () => {
    /*
     * IMPORTANT:
     *
     * We do NOT create Payment here.
     *
     * Stripe webhook will create it.
     *
     * Just show processing/success UI and
     * refresh shipment summary.
     */

    toast.success(
      "Stripe payment confirmed. Waiting for payment record update...",
    );

    setTimeout(async () => {
      await fetchShipment();

      setSuccess(true);
    }, 1500);
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      {/* BACK */}

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* HEADER */}

      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Receive Customer Payment
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Record a payment received from the customer for this shipment.
      </p>

      {/* =====================================================
          SNAPSHOT
      ===================================================== */}

      <div className="bg-white rounded-xl shadow border p-5 mb-6">
        <div className="mb-4">
          <p className="text-xs text-gray-500">Shipment</p>

          <p className="font-semibold text-gray-800 font-mono">
            {summary.shipment?.trackingNumber ?? "-"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Total</p>

            <p className="font-bold text-gray-800">
              $ {formatAmount(totalAmount)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Paid</p>

            <p className="font-bold text-green-600">
              $ {formatAmount(totalPaid)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Outstanding</p>

            <p className="font-bold text-red-600">
              $ {formatAmount(outstanding)}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FULLY PAID
      ===================================================== */}

      {outstanding <= 0 || summary.isFullyPaid ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          This shipment has already been paid in full.
        </div>
      ) : (
        <>
          {/* =================================================
              PAYMENT METHOD SELECT
          ================================================= */}

          <div className="bg-white rounded-xl shadow border p-6 mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>

            <select
              value={method}
              onChange={(e) => {
                const selected = e.target.value as PaymentMethod;

                setMethod(selected);

                /*
                 * Reset Stripe state if user switches
                 * away from Stripe.
                 */

                if (selected !== "STRIPE") {
                  setClientSecret(null);
                  setPaymentIntentId(null);
                }
              }}
              className="w-full border rounded-md px-3 py-2.5 text-sm"
            >
              {[...MANUAL_METHODS, "STRIPE"].map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              STRIPE
          ================================================= */}

          {method === "STRIPE" ? (
            <div className="space-y-5">
              {!clientSecret ? (
                <div className="bg-white rounded-xl shadow border p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard size={22} className="text-primary" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-800">
                        Stripe Online Payment
                      </h2>

                      <p className="text-xs text-gray-500">
                        Securely pay the outstanding balance using Stripe.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 border p-4 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Amount to pay
                      </span>

                      <span className="text-xl font-bold text-gray-900">
                        $ {formatAmount(outstanding)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStripePayment}
                    disabled={stripeLoading}
                    className="w-full bg-secondary text-white rounded-lg px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {stripeLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Preparing Secure Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Continue with Stripe
                      </>
                    )}
                  </button>
                </div>
              ) : (
                stripeOptions && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <div className="bg-white rounded-xl shadow border p-6">
                      <div className="mb-5">
                        <h2 className="font-semibold text-gray-800">
                          Complete Payment
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          Amount: ${formatAmount(outstanding)}
                        </p>
                      </div>

                      <StripePaymentForm
                        amount={outstanding}
                        shipmentId={params.id}
                        onSuccess={handleStripeSuccess}
                      />
                    </div>
                  </Elements>
                )
              )}
            </div>
          ) : (
            /* =================================================
               MANUAL PAYMENT
            ================================================= */

            <form
              onSubmit={handleManualSubmit}
              className="bg-white rounded-xl shadow border p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={outstanding}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => setAmount(String(outstanding))}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Pay full outstanding amount ($
                  {formatAmount(outstanding)})
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference
                </label>

                <input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>

                <input
                  type="datetime-local"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-secondary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Recording..." : "Receive Payment"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ReceiveCustomerPaymentPage;
