"use client";

import { MethodBadge, PaymentStatusBadge } from "@/components/Payments/Badges";
import api from "@/lib/axios";
import { IPayment, formatAmount, formatDate } from "@/lib/types";
import { Loader2, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /partner/payments
   "Customer Payments" - all customer payments belonging to
   the logged-in partner employee's own partner.

   Note: backend enforces payment.shipment.partnerId ===
   loggedInUser.partnerId regardless of any client-side filter.
============================================================ */

const PartnerPaymentsPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    try {
      setRefreshing(true);
      // No partnerId is sent - backend derives scope from the
      // logged-in partner employee's session/JWT.
      const res = await api.get("/api/v1/payment");
      const { data, meta } = res.data;
      setPayments(data ?? []);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const term = search.trim().toLowerCase();
    return payments.filter(
      (p) =>
        p.shipment?.trackingNumber?.toLowerCase().includes(term) ||
        p.shipment?.customer?.fullName?.toLowerCase().includes(term) ||
        p.transactionRef?.toLowerCase().includes(term),
    );
  }, [payments, search]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading payments...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customer Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All customer payments recorded by your team
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, customer, or reference"
            className="w-full border rounded-md pl-8 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Tracking</th>
                <th className="border p-3 text-left">Customer</th>
                <th className="border p-3 text-right">Amount</th>
                <th className="border p-3 text-left">Method</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-left">Reference</th>
                <th className="border p-3 text-left">Recorded By</th>
                <th className="border p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {formatDate(p.paidAt)}
                  </td>
                  <td className="border p-3 font-mono text-xs">
                    {p.shipment?.trackingNumber ?? "-"}
                  </td>
                  <td className="border p-3">
                    {p.shipment?.customer?.fullName ?? "-"}
                  </td>
                  <td className="border p-3 text-right font-medium">
                    $ {formatAmount(p.amount)}
                  </td>
                  <td className="border p-3">
                    <MethodBadge method={p.method} />
                  </td>
                  <td className="border p-3 text-center">
                    <PaymentStatusBadge
                      status={p.status}
                      isVoided={p.isVoided}
                    />
                  </td>
                  <td className="border p-3 text-xs">
                    {p.transactionRef ?? "-"}
                  </td>
                  <td className="border p-3">
                    {p.recordedBy?.fullName ?? "-"}
                  </td>
                  <td className="border p-3 text-center">
                    <Link
                      href={`/partner/payments/${p.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerPaymentsPage;
