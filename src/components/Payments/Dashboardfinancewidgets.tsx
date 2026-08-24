"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  AlertTriangle,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix: string;
}

interface ILedgerEntry {
  id: string;
  partnerId: string;
  partner: IPartner;
  debit: string | number;
  credit: string | number;
  createdAt: string;
}

interface IPayment {
  id: string;
  amount: string | number;
  isVoided: boolean;
  paidAt: string;
}

interface PartnerCreditInfo {
  id: string;
  companyName: string;
  trackingPrefix: string;
  creditLimit: number | null;
}

/* ============================================================
   COMPONENT
============================================================ */

const DashboardFinanceWidgets = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);

  const [ledgerEntries, setLedgerEntries] = useState<ILedgerEntry[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [partners, setPartners] = useState<PartnerCreditInfo[]>([]);

  const [loading, setLoading] = useState(true);

  /* ==========================================================
     FETCH
  ========================================================== */

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [ledgerRes, paymentsRes, partnersRes] = await Promise.all([
          api.get("/api/v1/partner-ledger"),
          api.get("/api/v1/payments"),
          api.get("/api/v1/partner"),
        ]);

        setLedgerEntries(ledgerRes.data?.data ?? []);
        setPayments(paymentsRes.data?.data ?? []);
        setPartners(partnersRes.data?.data ?? []);
      } catch (err) {
        console.error("Failed to load dashboard finance widgets:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ==========================================================
     PER-PARTNER BALANCE
  ========================================================== */

  const partnerBalances = useMemo(() => {
    const map = new Map<
      string,
      { partner: IPartner; debit: number; credit: number }
    >();

    for (const entry of ledgerEntries) {
      const existing = map.get(entry.partnerId) ?? {
        partner: entry.partner,
        debit: 0,
        credit: 0,
      };

      existing.debit += Number(entry.debit);
      existing.credit += Number(entry.credit);

      map.set(entry.partnerId, existing);
    }

    return Array.from(map.values())
      .map((v) => ({
        partner: v.partner,
        balance: v.debit - v.credit,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [ledgerEntries]);

  /* ==========================================================
     CREDIT LIMIT BREACHES
  ========================================================== */

  const creditLimitAlerts = useMemo(() => {
    return partnerBalances
      .map((pb) => {
        const partnerInfo = partners.find((p) => p.id === pb.partner.id);

        if (!partnerInfo || partnerInfo.creditLimit == null) return null;

        if (pb.balance > partnerInfo.creditLimit) {
          return {
            ...pb,
            creditLimit: partnerInfo.creditLimit,
          };
        }

        return null;
      })
      .filter(Boolean) as {
      partner: IPartner;
      balance: number;
      creditLimit: number;
    }[];
  }, [partnerBalances, partners]);

  /* ==========================================================
     TOTALS
  ========================================================== */

  const totals = useMemo(() => {
    const totalOutstanding = partnerBalances.reduce(
      (sum, p) => sum + (p.balance > 0 ? p.balance : 0),
      0,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysCollection = payments
      .filter((p) => !p.isVoided && new Date(p.paidAt) >= today)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthCollection = payments
      .filter((p) => !p.isVoided && new Date(p.paidAt) >= monthStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalOutstanding, todaysCollection, monthCollection };
  }, [partnerBalances, payments]);

  const formatMoney = (val: number) =>
    val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading finance overview...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-10 px-4">
      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Outstanding (Partners)
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                $ {formatMoney(totals.totalOutstanding)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Wallet size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Collection</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                $ {formatMoney(totals.todaysCollection)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month's Collection</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                $ {formatMoney(totals.monthCollection)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingDown size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* CREDIT LIMIT ALERTS */}
      {/* ====================================================== */}

      {creditLimitAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-600" size={18} />
            <h3 className="text-sm font-semibold text-red-700">
              Credit Limit Exceeded — {creditLimitAlerts.length} partner
              {creditLimitAlerts.length !== 1 ? "s" : ""}
            </h3>
          </div>

          <div className="space-y-2">
            {creditLimitAlerts.map((alert) => (
              <Link
                key={alert.partner.id}
                href={`${basePath}/partners/${alert.partner.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm hover:bg-red-50"
              >
                <span className="font-medium text-gray-800">
                  {alert.partner.companyName}
                </span>
                <span className="text-red-600 font-medium">
                  {formatMoney(alert.balance)} / limit{" "}
                  {formatMoney(alert.creditLimit)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* TOP PARTNERS BY OUTSTANDING BALANCE */}
      {/* ====================================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Top Partners by Outstanding Balance
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Partner</th>
                <th className="border p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {partnerBalances.slice(0, 5).map((pb) => (
                <tr key={pb.partner.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">
                    <Link
                      href={`${basePath}/partners/${pb.partner.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {pb.partner.companyName}
                    </Link>
                  </td>
                  <td
                    className={`border p-3 text-right font-medium ${
                      pb.balance > 0 ? "text-red-600" : "text-gray-400"
                    }`}
                  >
                    $ {formatMoney(pb.balance)}
                  </td>
                </tr>
              ))}

              {partnerBalances.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-400">
                    No ledger data yet.
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

export default DashboardFinanceWidgets;
