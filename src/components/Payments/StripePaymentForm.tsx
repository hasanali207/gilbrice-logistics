"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface StripePaymentFormProps {
  amount: number;
  shipmentId: string;
  onSuccess: () => void;
}

const StripePaymentForm = ({
  amount,
  shipmentId,
  onSuccess,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not ready yet.");
      return;
    }

    try {
      setProcessing(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/partner/shipments/${shipmentId}/payment`,
        },

        redirect: "if_required",
      });

      if (error) {
        console.error("Stripe error:", error);
        toast.error(error.message || "Payment failed");
        return;
      }

      /*
       * IMPORTANT:
       *
       * Do NOT call POST /api/v1/payment here.
       *
       * Stripe webhook will call:
       *
       * confirmStripePayment(paymentIntent.id)
       *
       * and backend will create the Payment record.
       */

      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful. Updating payment record...");

        onSuccess();
        return;
      }

      if (paymentIntent?.status === "processing") {
        toast.success("Payment is processing. Please wait for confirmation.");

        onSuccess();
        return;
      }

      toast.error(
        `Payment was not completed. Status: ${
          paymentIntent?.status || "unknown"
        }`,
      );
    } catch (error: any) {
      console.error("Stripe payment error:", error);

      toast.error(
        error?.message || "Something went wrong while processing payment",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe Card / Payment UI */}

      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard size={20} className="text-primary" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">Online Payment</h3>

            <p className="text-xs text-gray-500">
              Securely pay using card or available payment methods.
            </p>
          </div>
        </div>

        <PaymentElement />
      </div>

      {/* Security */}

      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <ShieldCheck size={18} className="text-green-600 mt-0.5 shrink-0" />

        <div>
          <p className="text-sm font-medium text-green-800">Secure payment</p>

          <p className="text-xs text-green-700 mt-1">
            Your payment information is securely processed by Stripe. Your card
            details are never stored on our server.
          </p>
        </div>
      </div>

      {/* Pay */}

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="
          w-full
          bg-secondary
          text-white
          rounded-lg
          px-4
          py-3
          text-sm
          font-semibold
          hover:opacity-90
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex
          items-center
          justify-center
          gap-2
        "
      >
        {processing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
