"use client";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
);

interface ShipmentSummary {
  id: string;

  trackingNumber?: string;

  senderName?: string;
  receiverName?: string;

  pickupAddress?: string;
  deliveryAddress?: string;

  shippingCharge: number;

  currency?: string;

  paymentStatus?: string;

  partnerId?: string;
}

interface PaymentIntentResponse {
  clientSecret?: string;
  data?: {
    clientSecret?: string;
  };
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const router = useRouter();
  const searchParams = useSearchParams();

  const shipmentId = searchParams.get("shipmentId");

  const [shipment, setShipment] = useState<ShipmentSummary | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // =========================================================
  // FETCH SHIPMENT
  // =========================================================

  useEffect(() => {
    const fetchShipment = async () => {
      if (!shipmentId) {
        toast.error("Shipment ID is missing.");
        setPageLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_URL}/shipment/${shipmentId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch shipment");
        }

        /**
         * Supports:
         *
         * {
         *   success: true,
         *   data: shipment
         * }
         *
         * OR
         *
         * shipment directly
         */

        setShipment(data?.data ?? data);
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error ? error.message : "Unable to load shipment.",
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  // =========================================================
  // PAYMENT
  // =========================================================

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is not ready yet.");
      return;
    }

    if (!shipment) {
      toast.error("Shipment information is missing.");
      return;
    }

    if (!shipment.id) {
      toast.error("Shipment ID is missing.");
      return;
    }

    if (shipment.paymentStatus === "PAID") {
      toast.success("This shipment is already paid.");

      router.push(`/shipments/${shipment.id}`);

      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // =====================================================
      // STEP 1
      // CREATE STRIPE PAYMENT INTENT
      // =====================================================

      /**
       * IMPORTANT:
       *
       * amount frontend থেকে পাঠানো হচ্ছে না।
       *
       * Backend shipmentId দেখে নিজে amount calculate করবে।
       *
       * তোমার backend-এ এই endpoint থাকতে হবে:
       *
       * POST /payment/create-payment-intent
       */

      const intentResponse = await fetch(
        `${BASE_URL}/payment/create-payment-intent`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },

          body: JSON.stringify({
            shipmentId: shipment.id,
          }),
        },
      );

      const intentData: PaymentIntentResponse = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(
          (intentData as any)?.message || "Unable to create Stripe payment.",
        );
      }

      const clientSecret =
        intentData?.clientSecret ?? intentData?.data?.clientSecret;

      if (!clientSecret) {
        throw new Error("Stripe client secret was not returned.");
      }

      // =====================================================
      // STEP 2
      // GET CARD ELEMENT
      // =====================================================

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Please enter your card information.");
      }

      // =====================================================
      // STEP 3
      // CONFIRM STRIPE PAYMENT
      // =====================================================

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed.");

        return;
      }

      if (
        !result.paymentIntent ||
        result.paymentIntent.status !== "succeeded"
      ) {
        toast.error("Payment was not completed.");

        return;
      }

      const paymentIntent = result.paymentIntent;

      // =====================================================
      // STEP 4
      // SAVE PAYMENT IN YOUR DATABASE
      // =====================================================

      /**
       * Stripe payment সফল হওয়ার পরে
       *
       * POST /api/v1/payment
       *
       * call হবে।
       *
       * transactionRef হিসেবে Stripe paymentIntent.id
       * রাখা হবে।
       */

      const paymentResponse = await fetch(`${BASE_URL}/payment`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },

        body: JSON.stringify({
          partnerId: shipment.partnerId ?? undefined,

          shipmentId: shipment.id,

          /**
           * IMPORTANT:
           *
           * Stripe amount cents-এ রাখে।
           *
           * তোমার payment API যদি 6700 = $67.00
           * হিসেবে amount নেয়, তাহলে এখানে / 100 করতে হবে।
           *
           * যদি backend cents নেয়, তাহলে /100 করবে না।
           */

          amount: paymentIntent.amount / 100,

          /**
           * Backend enum-এ STRIPE থাকতে হবে।
           *
           * Example:
           * CASH
           * STRIPE
           */

          method: "STRIPE",

          /**
           * Stripe PaymentIntent ID
           */

          transactionRef: paymentIntent.id,

          paidAt: new Date().toISOString(),
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData?.message ||
            "Payment succeeded but database record failed.",
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      toast.success("Payment successful!");

      router.push(`/shipments/${shipment.id}`);
    } catch (error) {
      console.error("Payment error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-500">Loading shipment...</div>
      </div>
    );
  }

  // =========================================================
  // SHIPMENT NOT FOUND
  // =========================================================

  if (!shipment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Shipment not found
          </h2>

          <button
            onClick={() => router.push("/shipments")}
            className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-white"
          >
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // AMOUNT
  // =========================================================

  const amount = Number(shipment.shippingCharge || 0);

  const currency = (shipment.currency || "USD").toUpperCase();

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipment Payment</h1>

          <p className="mt-2 text-sm text-gray-500">
            Complete your payment to confirm this shipment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="lg:col-span-2">
            {/* SHIPMENT DETAILS */}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipment Details
                  </h2>

                  {shipment.trackingNumber && (
                    <p className="mt-1 text-sm text-gray-500">
                      Tracking:{" "}
                      <span className="font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </span>
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    shipment.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {shipment.paymentStatus || "UNPAID"}
                </span>
              </div>

              <div className="space-y-5">
                {shipment.senderName && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Sender
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {shipment.senderName}
                    </p>
                  </div>
                )}

                {shipment.receiverName && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Receiver
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {shipment.receiverName}
                    </p>
                  </div>
                )}

                {shipment.pickupAddress && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Pickup Address
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {shipment.pickupAddress}
                    </p>
                  </div>
                )}

                {shipment.deliveryAddress && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Delivery Address
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {shipment.deliveryAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT DETAILS */}

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Payment Details
              </h2>

              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#1f2937",

                        "::placeholder": {
                          color: "#9ca3af",
                        },
                      },

                      invalid: {
                        color: "#dc2626",
                      },
                    },
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Your card information is securely processed by Stripe.
              </p>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div>
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Payment Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping Charge</span>

                  <span className="font-medium text-gray-900">
                    {currency} {amount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>

                    <span className="text-2xl font-bold text-gray-900">
                      {currency} {amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  loading ||
                  !stripe ||
                  !elements ||
                  shipment.paymentStatus === "PAID"
                }
                className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing Payment..."
                  : shipment.paymentStatus === "PAID"
                    ? "Already Paid"
                    : `Pay ${currency} ${amount.toFixed(2)}`}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Your payment is securely processed by Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// STRIPE PROVIDER
// =========================================================

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
