"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  Ban,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD";
type PaymentStatusT = "CONFIRMED" | "VOIDED" | "PENDING";

interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix: string;
}

interface IShipment {
  id: string;
  trackingNumber: string;
  partnerId: string;
  partner?: IPartner;
}

interface IPayment {
  id: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatusT;
  transactionRef?: string | null;
  paidAt: string;
  isVoided: boolean;
  voidReason?: string | null;
  shipment: IShipment;
  recordedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
}

/* ============================================================
   COMPONENT
============================================================ */

const AllPaymentsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  const [payments, setPayments] = useState<IPayment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "CONFIRMED" | "VOIDED"
  >("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [searchTerm, setSearchTerm] = useState("");

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchPayments = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/api/v1/payments");

      setPayments(res.data?.data ?? []);
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

  /* ==========================================================
     FILTERED LIST
  ========================================================== */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter === "CONFIRMED" && p.isVoided) return false;
      if (statusFilter === "VOIDED" && !p.isVoided) return false;

      if (methodFilter !== "ALL" && p.method !== methodFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();

        const matchesTracking = p.shipment?.trackingNumber
          ?.toLowerCase()
          .includes(term);

        const matchesPartner = p.shipment?.partner?.companyName
          ?.toLowerCase()
          .includes(term);

        const matchesRef = p.transactionRef?.toLowerCase().includes(term);

        if (!matchesTracking && !matchesPartner && !matchesRef) return false;
      }

      return true;
    });
  }, [payments, statusFilter, methodFilter, searchTerm]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    const confirmed = payments.filter((p) => !p.isVoided);
    const voided = payments.filter((p) => p.isVoided);

    const totalCollected = confirmed.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const totalVoided = voided.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalCollected,
      totalVoided,
      confirmedCount: confirmed.length,
      voidedCount: voided.length,
    };
  }, [payments]);

  /* ==========================================================
     FORMAT
  ========================================================== */

  const formatAmount = (amount: string | number) =>
    Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  /* ==========================================================
     LOADING
  ========================================================== */

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
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Payments</h1>

          <p className="text-sm text-gray-500 mt-1">
            Customer payments across all partners and shipments
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

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                $ {formatAmount(summary.totalCollected)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary.confirmedCount} confirmed payment
                {summary.confirmedCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Wallet size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Voided Amount</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                $ {formatAmount(summary.totalVoided)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary.voidedCount} voided payment
                {summary.voidedCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <XCircle size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {payments.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-col md:flex-row gap-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by tracking no, partner, or ref"
          className="flex-1 border rounded-md px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="VOIDED">Voided</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="MOBILE_BANKING">Mobile Banking</option>
          <option value="CARD">Card</option>
        </select>
      </div>

      {/* ====================================================== */}
      {/* PAYMENTS TABLE */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment Transactions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredPayments.length} transaction
            {filteredPayments.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Partner</th>
                <th className="border p-3 text-left">Shipment</th>
                <th className="border p-3 text-left">Method</th>
                <th className="border p-3 text-left">Ref</th>
                <th className="border p-3 text-right">Amount</th>
                <th className="border p-3 text-left">Recorded By</th>
                <th className="border p-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {formatDate(p.paidAt)}
                  </td>

                  <td className="border p-3">
                    <div className="font-medium text-gray-800">
                      {p.shipment?.partner?.companyName ?? "-"}
                    </div>
                    {p.shipment?.partner?.trackingPrefix && (
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {p.shipment.partner.trackingPrefix}
                      </div>
                    )}
                  </td>

                  <td className="border p-3">
                    {p.shipment ? (
                      <Link
                        href={`${basePath}/shipments/${p.shipment.id}`}
                        className="text-blue-600 hover:underline font-mono text-xs"
                      >
                        {p.shipment.trackingNumber}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="border p-3">{p.method}</td>

                  <td className="border p-3">{p.transactionRef ?? "-"}</td>

                  <td className="border p-3 text-right font-medium">
                    $ {formatAmount(p.amount)}
                  </td>

                  <td className="border p-3">
                    {p.recordedBy?.fullName ?? "-"}
                  </td>

                  <td className="border p-3 text-center">
                    <span
                      className={
                        p.isVoided
                          ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                          : "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      }
                    >
                      {p.isVoided ? (
                        <>
                          <Ban size={12} /> Voided
                        </>
                      ) : (
                        p.status
                      )}
                    </span>
                    {p.isVoided && p.voidReason && (
                      <p className="text-xs text-gray-400 mt-1">
                        {p.voidReason}
                      </p>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
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

export default AllPaymentsPage;
