"use client";

import { MethodBadge, PaymentStatusBadge } from "@/components/Payments/Badges";
import api from "@/lib/axios";
import {
  IPartner,
  IPayment,
  PaymentMethod,
  PaymentStatusT,
  formatAmount,
  formatDate,
} from "@/lib/types";
import { Loader2, RefreshCw, Search, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /staff/payments
   "All Customer Payments" - Gilbrice staff view of every
   customer payment across every partner.
============================================================ */

const StaffAllPaymentsPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // filters
  const [partnerFilter, setPartnerFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatusT>(
    "ALL",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [trackingSearch, setTrackingSearch] = useState("");
  const [refSearch, setRefSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchPartners = async () => {
    try {
      const res = await api.get("/api/v1/partner");
      setPartners(res.data?.data ?? []);
    } catch (error) {
      // partner list is a non-critical filter helper; fail silently
      console.error("Failed to fetch partners", error);
    }
  };

  const fetchPayments = async () => {
    try {
      setRefreshing(true);

      const params: Record<string, string> = {};
      if (partnerFilter !== "ALL") params.partnerId = partnerFilter;
      if (methodFilter !== "ALL") params.method = methodFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (trackingSearch) params.trackingNumber = trackingSearch;
      if (refSearch) params.transactionRef = refSearch;

      const res = await api.get("/api/v1/payment", { params });
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
    fetchPartners();
  }, []);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerFilter, methodFilter, statusFilter, dateFrom, dateTo]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (
        trackingSearch.trim() &&
        !p.shipment?.trackingNumber
          ?.toLowerCase()
          .includes(trackingSearch.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        refSearch.trim() &&
        !p.transactionRef
          ?.toLowerCase()
          .includes(refSearch.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [payments, trackingSearch, refSearch]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  const totalCollected = useMemo(
    () =>
      payments
        .filter((p) => !p.isVoided)
        .reduce((sum, p) => sum + Number(p.amount), 0),
    [payments],
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading payments...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            All Customer Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customer payments recorded across every partner on the platform
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                $ {formatAmount(totalCollected)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Wallet size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {payments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-500">Partners Represented</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {new Set(payments.map((p) => p.shipment?.partnerId)).size}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          value={partnerFilter}
          onChange={(e) => {
            setPage(1);
            setPartnerFilter(e.target.value);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.companyName}
            </option>
          ))}
        </select>

        <select
          value={methodFilter}
          onChange={(e) => {
            setPage(1);
            setMethodFilter(e.target.value as any);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="MOBILE_BANKING">Mobile Banking</option>
          <option value="CARD">Card</option>
          <option value="CHEQUE">Cheque</option>
          <option value="STRIPE">Stripe</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as any);
          }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="VOIDED">Voided</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={trackingSearch}
            onChange={(e) => setTrackingSearch(e.target.value)}
            placeholder="Tracking number"
            className="w-full border rounded-md pl-8 pr-3 py-2 text-sm"
          />
        </div>

        <div className="relative lg:col-span-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={refSearch}
            onChange={(e) => setRefSearch(e.target.value)}
            placeholder="Transaction ref"
            className="w-full border rounded-md pl-8 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Payment Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPayments.length} transaction
              {filteredPayments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Payment ID</th>
                <th className="border p-3 text-left">Tracking Number</th>
                <th className="border p-3 text-left">Partner</th>
                <th className="border p-3 text-left">Customer</th>
                <th className="border p-3 text-right">Amount</th>
                <th className="border p-3 text-left">Method</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-left">Transaction Ref</th>
                <th className="border p-3 text-left">Recorded By</th>
                <th className="border p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {formatDate(p.paidAt)}
                  </td>
                  <td className="border p-3 font-mono text-xs">
                    {p.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="border p-3 font-mono text-xs">
                    {p.shipment?.trackingNumber ?? "-"}
                  </td>
                  <td className="border p-3">
                    {p.shipment?.partner?.companyName ?? "-"}
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
                      href={`/staff/payments/${p.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredPayments.length > pageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t text-sm">
            <span className="text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border rounded-md px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="border rounded-md px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAllPaymentsPage;
