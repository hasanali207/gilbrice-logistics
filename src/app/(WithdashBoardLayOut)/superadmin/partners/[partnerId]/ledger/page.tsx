"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import {
  IPartner,
  IPartnerLedgerEntry,
  formatAmount,
  formatDate,
} from "@/lib/types";
import { RootState } from "@/Redux/store";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   PAGE: /staff/partners/[partnerId]/ledger
   "Partner Ledger" - Partner <-> Gilbrice financial ledger
   (NOT the customer payment ledger).
============================================================ */

interface ILedgerSummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  creditLimit: number | null;
  availableCredit: number | null;
  creditExceeded: boolean;
}

const StaffPartnerLedgerPage = () => {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();

  const [partner, setPartner] = useState<IPartner | null>(null);
  const [entries, setEntries] = useState<IPartnerLedgerEntry[]>([]);
  const [summary, setSummary] = useState<ILedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/partner-ledger/${params.partnerId}`);
      const data = res.data?.data ?? {};
      setPartner(data.partner ?? null);
      setEntries(data.entries ?? []);
      setSummary(data.summary ?? null);
    } catch (error: any) {
      console.error("Failed to fetch partner ledger:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load partner ledger",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.partnerId) fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.partnerId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading ledger...
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 text-center text-gray-500">
        Partner not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {partner.companyName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            {partner.trackingPrefix}
          </p>
        </div>

        <Link href={`${basePath}/partners/${partner.id}/settlement`}>
          <Button
            className="inline-flex items-center gap-2 bg-secondary text-white rounded-lg px-4 py-2 text-sm hover:opacity-90"
            variant="outline"
          >
            <CreditCard size={14} /> Record Settlement
          </Button>
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-gray-500">Total Charges</p>
          <p className="text-lg font-bold text-gray-800 mt-1">
            $ {formatAmount(summary?.totalDebit ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-gray-500">Total Settlements</p>
          <p className="text-lg font-bold text-green-600 mt-1">
            $ {formatAmount(summary?.totalCredit ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-lg font-bold text-red-600 mt-1">
            $ {formatAmount(summary?.balance ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-gray-500">Credit Limit</p>
          <p className="text-lg font-bold text-gray-800 mt-1">
            {summary?.creditLimit !== null && summary?.creditLimit !== undefined
              ? `$ ${formatAmount(summary.creditLimit)}`
              : "No limit"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-xs text-gray-500">Available Credit</p>
          <p
            className={`text-lg font-bold mt-1 ${
              summary?.creditExceeded ? "text-red-600" : "text-gray-800"
            }`}
          >
            {summary?.availableCredit !== null &&
            summary?.availableCredit !== undefined
              ? `$ ${formatAmount(summary.availableCredit)}`
              : "-"}
          </p>
        </div>
      </div>

      {summary?.creditExceeded && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
          This partner has exceeded their approved credit limit.
        </div>
      )}

      {/* LEDGER TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Ledger</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Shipment</th>
                <th className="border p-3 text-right">Debit</th>
                <th className="border p-3 text-right">Credit</th>
                <th className="border p-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="border p-3">{entry.description}</td>
                  <td className="border p-3 font-mono text-xs">
                    {entry.shipment?.trackingNumber ?? "-"}
                  </td>
                  <td className="border p-3 text-right text-red-600">
                    {Number(entry.debit) > 0
                      ? `$ ${formatAmount(entry.debit)}`
                      : "-"}
                  </td>
                  <td className="border p-3 text-right text-green-600">
                    {Number(entry.credit) > 0
                      ? `$ ${formatAmount(entry.credit)}`
                      : "-"}
                  </td>
                  <td className="border p-3 text-right font-semibold">
                    $ {formatAmount(entry.runningBalance)}
                  </td>
                </tr>
              ))}

              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No ledger entries yet.
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

export default StaffPartnerLedgerPage;
