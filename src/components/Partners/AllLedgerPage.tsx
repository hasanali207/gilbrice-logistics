"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix: string;
}

interface IShipment {
  id: string;
  trackingNumber: string;
  status: string;
  partnerCost: string | number;
}

interface ILedgerEntry {
  id: string;
  partnerId: string;
  shipmentId: string | null;
  description: string;
  debit: string | number;
  credit: string | number;
  runningBalance: string | number;
  createdAt: string;
  partner: IPartner;
  shipment: IShipment | null;
}

const AllLedgerPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  const [entries, setEntries] = useState<ILedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLedger = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/api/v1/partner-ledger");

      console.log("PARTNER LEDGER RESPONSE:", res.data);

      setEntries(res.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch partner ledger:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load partner ledger",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const totalDebit = entries.reduce(
      (sum, entry) => sum + Number(entry.debit),
      0,
    );

    const totalCredit = entries.reduce(
      (sum, entry) => sum + Number(entry.credit),
      0,
    );

    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit,
    };
  }, [entries]);

  // ============================================================
  // FORMAT
  // ============================================================

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading partner ledger...
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
          <h1 className="text-2xl font-bold text-gray-800">Partner Ledger</h1>

          <p className="text-sm text-gray-500 mt-1">
            All partner charges and settlement transactions
          </p>
        </div>

        <button
          onClick={fetchLedger}
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
        {/* Total Debit */}

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Charges</p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                $ {formatAmount(summary.totalDebit)}
              </p>
            </div>

            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <ArrowUpRight size={22} />
            </div>
          </div>
        </div>

        {/* Total Credit */}

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Settlements</p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                $ {formatAmount(summary.totalCredit)}
              </p>
            </div>

            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ArrowDownLeft size={22} />
            </div>
          </div>
        </div>

        {/* Outstanding */}

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Balance</p>

              <p
                className={`text-2xl font-bold mt-1 ${
                  summary.balance > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                $ {formatAmount(summary.balance)}
              </p>
            </div>

            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CreditCard size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* LEDGER TABLE */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Ledger Transactions
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {entries.length} transaction
            {entries.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>

                <th className="border p-3 text-left">Partner</th>

                <th className="border p-3 text-left">Type</th>

                <th className="border p-3 text-left">Description</th>

                <th className="border p-3 text-left">Shipment</th>

                <th className="border p-3 text-right">Debit</th>

                <th className="border p-3 text-right">Credit</th>

                <th className="border p-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => {
                const debit = Number(entry.debit);
                const credit = Number(entry.credit);
                const isSettlement = credit > 0;

                return (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    {/* DATE */}

                    <td className="border p-3 whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>

                    {/* PARTNER */}

                    <td className="border p-3">
                      <div className="font-medium text-gray-800">
                        {entry.partner.companyName}
                      </div>

                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {entry.partner.trackingPrefix}
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="border p-3">
                      {isSettlement ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <ArrowDownLeft size={13} />
                          Settlement
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          <ArrowUpRight size={13} />
                          Charge
                        </span>
                      )}
                    </td>

                    {/* DESCRIPTION */}

                    <td className="border p-3">{entry.description}</td>

                    {/* SHIPMENT */}

                    <td className="border p-3">
                      {entry.shipment ? (
                        <Link
                          href={`${basePath}/shipments/${entry.shipment.id}`}
                          className="text-blue-600 hover:underline font-mono text-xs"
                        >
                          {entry.shipment.trackingNumber}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* DEBIT */}

                    <td className="border p-3 text-right">
                      {debit > 0 ? (
                        <span className="font-medium text-red-600">
                          $ {formatAmount(debit)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* CREDIT */}

                    <td className="border p-3 text-right">
                      {credit > 0 ? (
                        <span className="font-medium text-green-600">
                          $ {formatAmount(credit)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* RUNNING BALANCE */}

                    <td className="border p-3 text-right">
                      <span
                        className={`font-bold ${
                          Number(entry.runningBalance) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        $ {formatAmount(entry.runningBalance)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* EMPTY */}

              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No ledger transactions found.
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

export default AllLedgerPage;
