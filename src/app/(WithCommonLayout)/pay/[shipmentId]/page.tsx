"use client";

import StripePaymentForm from "@/components/Payments/StripePaymentForm";
import { formatAmount } from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

interface IPublicShipment {
  id: string;
  trackingNumber: string;
  status: string;
  finalCustomerAmount: number;
  amountPaidByCustomer: number;
  customerBalance: number;
  customerDisplayName: string;
  partner: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
  };
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API;

const CustomerShipmentPaymentPage = () => {
  const params = useParams<{ shipmentId: string }>();
  const router = useRouter();

  const [shipment, setShipment] = useState<IPublicShipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingPayment, setStartingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);

  // ============================================================
  // FETCH PUBLIC SHIPMENT
  // ============================================================

  const fetchShipment = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/v1/public/shipment/${params.shipmentId}`);

      console.log("PUBLIC SHIPMENT RESPONSE:", res.data);

      setShipment(res.data?.data ?? null);
    } catch (error: any) {
      console.error("Failed to load shipment:", error);

      toast.error(error?.response?.data?.message || "Unable to load shipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [params.shipmentId]);

  // ============================================================
  // CREATE PUBLIC STRIPE PAYMENT INTENT
  // ============================================================

  const handlePayNow = async () => {
    if (!shipment) return;

    const due = Number(shipment.customerBalance || 0);

    if (due <= 0) {
      toast.success("This shipment has already been paid in full.");
      return;
    }

    try {
      setStartingPayment(true);

      const response = await fetch(`${API_URL}/api/v1/public/payment/intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          partnerId: shipment.partner.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to initialize payment");
      }

      const data = result?.data;

      if (!data?.clientSecret) {
        throw new Error("Payment client secret was not returned");
      }

      setClientSecret(data.clientSecret);
      setPaymentStarted(true);
    } catch (error: any) {
      console.error("Failed to create payment intent:", error);

      toast.error(error?.message || "Unable to start secure payment");
    } finally {
      setStartingPayment(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={22} className="animate-spin" />
          Loading shipment...
        </div>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center">
            <Package size={26} className="text-gray-400" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            Shipment Not Found
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            This shipment could not be found.
          </p>

          <button
            type="button"
            onClick={() => router.push("/pay")}
            className="mt-5 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium"
          >
            Search Again
          </button>
        </div>
      </div>
    );
  }

  const total = Number(shipment.finalCustomerAmount || 0);
  const paid = Number(shipment.amountPaidByCustomer || 0);
  const due = Number(shipment.customerBalance || 0);

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            borderRadius: "10px",
          },
        },
      }
    : undefined;

  // ============================================================
  // STRIPE SUCCESS
  // ============================================================

  const handleStripeSuccess = async () => {
    toast.success("Payment submitted successfully.");

    /*
     * Stripe webhook is authoritative.
     * Refresh shipment after a short delay.
     */

    setTimeout(async () => {
      await fetchShipment();

      setPaymentStarted(false);
      setClientSecret(null);
    }, 2000);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 max-w-3xl mx-auto">
      <div className="w-full max-w-lg mx-auto">
        {/* BACK */}

        <button
          type="button"
          onClick={() => router.push("/pay")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5"
        >
          <ArrowLeft size={16} />
          Search another shipment
        </button>

        {/* BRANDING */}

        <div className="bg-secondary rounded-t-2xl px-6 py-6 text-center text-white">
          {shipment.partner.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shipment.partner.logoUrl}
              alt={shipment.partner.companyName}
              className="h-10 max-w-[150px] mx-auto mb-3 object-contain"
            />
          )}

          <h1 className="text-lg font-semibold">
            {shipment.partner.companyName}
          </h1>

          <p className="text-xs opacity-80 mt-1">Shipment Payment</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0">
          {/* SHIPMENT INFO */}

          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>

                <p className="mt-1 font-mono font-semibold text-gray-900">
                  {shipment.trackingNumber}
                </p>
              </div>

              <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                {shipment.status}
              </span>
            </div>

            {shipment.customerDisplayName && (
              <div className="mt-4">
                <p className="text-xs text-gray-500">Customer</p>

                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {shipment.customerDisplayName}
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT SUMMARY */}

          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipment Amount</span>

                <span className="font-medium text-gray-900">
                  $ {formatAmount(total)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Already Paid</span>

                <span className="font-medium text-green-600">
                  $ {formatAmount(paid)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Amount Due</span>

                <span className="text-2xl font-bold text-gray-900">
                  $ {formatAmount(due)}
                </span>
              </div>
            </div>

            {/* FULLY PAID */}

            {due <= 0 ? (
              <div className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-4 flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="text-green-600 mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Payment Complete
                  </p>

                  <p className="text-xs text-green-700 mt-1">
                    This shipment has already been paid in full.
                  </p>
                </div>
              </div>
            ) : !paymentStarted ? (
              /* PAY NOW */

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={startingPayment}
                  className="w-full h-12 rounded-xl bg-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startingPayment ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Preparing Secure Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay $ {formatAmount(due)}
                    </>
                  )}
                </button>

                <div className="flex justify-center items-center gap-1.5 mt-4 text-xs text-gray-400">
                  <ShieldCheck size={14} />
                  Secure payment powered by Stripe
                </div>
              </div>
            ) : (
              /* STRIPE */

              stripeOptions && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Complete Your Payment
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Enter your payment details below.
                    </p>
                  </div>

                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripePaymentForm
                      amount={due}
                      shipmentId={shipment.id}
                      onSuccess={handleStripeSuccess}
                    />
                  </Elements>

                  <div className="flex justify-center items-center gap-1.5 mt-5 text-xs text-gray-400">
                    <ShieldCheck size={14} />
                    Your payment information is securely processed by Stripe.
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Powered by Gilbrice Logistics
        </p>
      </div>
    </div>
  );
};

export default CustomerShipmentPaymentPage;
