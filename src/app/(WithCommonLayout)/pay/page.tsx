"use client";

import { Loader2, PackageSearch, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_BASE_API;

const CustomerShipmentSearchPage = () => {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const tracking = trackingNumber.trim();

    if (!tracking) {
      toast.error("Please enter your tracking number");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/v1/public/shipment/search?trackingNumber=${encodeURIComponent(
          tracking,
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Shipment not found");
      }

      const shipment = result?.data;

      if (!shipment?.id) {
        toast.error("Shipment not found");
        return;
      }

      router.push(`/pay/${shipment.id}`);
    } catch (error: any) {
      console.error("Shipment search error:", error);

      toast.error(error?.message || "Shipment not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* HEADER */}

        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
            <PackageSearch size={28} className="text-secondary" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Shipment Payment</h1>

          <p className="text-sm text-gray-500 mt-2 leading-6">
            Enter your shipment tracking number to view your shipment and make a
            payment.
          </p>
        </div>

        {/* SEARCH CARD */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>

              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. GLB-123456"
                autoComplete="off"
                autoFocus
                disabled={loading}
                className="
                  w-full
                  h-12
                  rounded-xl
                  border border-gray-200
                  bg-white
                  px-4
                  text-sm
                  font-mono
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-secondary
                  focus:ring-4
                  focus:ring-secondary/10
                  disabled:bg-gray-50
                  disabled:cursor-not-allowed
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-12
                rounded-xl
                bg-secondary
                text-white
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                hover:opacity-90
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Finding Shipment...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Find Shipment
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-5">
              Your tracking number can be found on your shipment confirmation.
            </p>
          </div>
        </div>

        {/* SECURITY */}

        <div className="flex items-center justify-center gap-1.5 mt-6">
          <span className="text-xs text-gray-400">
            Secure payment powered by Stripe
          </span>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-2">
          Powered by Gilbrice Logistics
        </p>
      </div>
    </div>
  );
};

export default CustomerShipmentSearchPage;
