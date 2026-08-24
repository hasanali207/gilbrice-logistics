"use client";

import api from "@/lib/axios";
import { IPartner, IPartnerLedgerEntry, formatAmount } from "@/lib/types";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /staff/reports/partner-ledger
   "Partner Ledger Report" - every partner's financial
   position side by side.

   There is no dedicated aggregate endpoint for this in the
   backend - GET /api/v1/partner-ledger (getPartnerLedger)
   returns the RAW list of ledger entries (each with a nested
   `partner: { id, companyName, trackingPrefix }`), the same
   shape used by the single-partner ledger page. So this page
   fetches that raw list plus the partner list (for
   creditLimit/isActive, which aren't included on the entry's
   nested partner object) and aggregates client-side.
============================================================ */

interface IPartnerLedgerSummaryRow {
  partnerId: string;
  companyName: string;
  trackingPrefix: string;
  totalCharges: number;
  totalSettlements: number;
  outstanding: number;
  creditLimit: number | null;
  availableCredit: number | null;
  isActive: boolean;
}

const StaffPartnerLedgerReportPage = () => {
  const [rows, setRows] = useState<IPartnerLedgerSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const [balanceStatus, setBalanceStatus] = useState<
    "ALL" | "OUTSTANDING" | "SETTLED" | "EXCEEDED"
  >("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1) raw ledger entries (all partners) + 2) partner master list,
      // fetched in parallel.
      const [entriesRes, partnersRes] = await Promise.all([
        api.get("/api/v1/partner-ledger", {
          params: {
            ...(dateFrom ? { dateFrom } : {}),
            ...(dateTo ? { dateTo } : {}),
          },
        }),
        api.get("/api/v1/partner"),
      ]);

      const entries: IPartnerLedgerEntry[] = entriesRes.data?.data ?? [];
      const partners: IPartner[] = partnersRes.data?.data ?? [];

      const partnerById = new Map(partners.map((p) => [p.id, p]));

      // Group entries by partnerId and sum debit/credit.
      const grouped = new Map<
        string,
        {
          companyName: string;
          trackingPrefix: string;
          debit: number;
          credit: number;
        }
      >();

      for (const entry of entries) {
        const pid = entry.partnerId;
        const existing = grouped.get(pid);

        const debit = Number(entry.debit);
        const credit = Number(entry.credit);

        if (existing) {
          existing.debit += debit;
          existing.credit += credit;
        } else {
          grouped.set(pid, {
            companyName: entry.partner?.companyName ?? "-",
            trackingPrefix: entry.partner?.trackingPrefix ?? "-",
            debit,
            credit,
          });
        }
      }

      const summaryRows: IPartnerLedgerSummaryRow[] = Array.from(
        grouped.entries(),
      ).map(([partnerId, g]) => {
        const master = partnerById.get(partnerId);
        const outstanding = g.debit - g.credit;
        const creditLimit = master?.creditLimit
          ? Number(master.creditLimit)
          : null;
        const availableCredit =
          creditLimit !== null ? Math.max(creditLimit - outstanding, 0) : null;

        return {
          partnerId,
          companyName: master?.companyName ?? g.companyName,
          trackingPrefix: master?.trackingPrefix ?? g.trackingPrefix,
          totalCharges: g.debit,
          totalSettlements: g.credit,
          outstanding,
          creditLimit,
          availableCredit,
          isActive: master?.isActive ?? true,
        };
      });

      // Include partners with zero ledger activity too (e.g. brand new
      // partners), so the report doesn't silently hide them.
      for (const p of partners) {
        if (!grouped.has(p.id)) {
          const creditLimit = p.creditLimit ? Number(p.creditLimit) : null;
          summaryRows.push({
            partnerId: p.id,
            companyName: p.companyName,
            trackingPrefix: p.trackingPrefix,
            totalCharges: 0,
            totalSettlements: 0,
            outstanding: 0,
            creditLimit,
            availableCredit: creditLimit,
            isActive: p.isActive ?? true,
          });
        }
      }

      summaryRows.sort((a, b) => b.outstanding - a.outstanding);

      setRows(summaryRows);
    } catch (error: any) {
      console.error("Failed to fetch partner ledger report:", error);
      toast.error(error?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (
        search.trim() &&
        !r.companyName.toLowerCase().includes(search.trim().toLowerCase())
      ) {
        return false;
      }

      if (balanceStatus === "OUTSTANDING" && r.outstanding <= 0) return false;
      if (balanceStatus === "SETTLED" && r.outstanding > 0) return false;
      if (
        balanceStatus === "EXCEEDED" &&
        !(r.creditLimit !== null && r.outstanding > r.creditLimit)
      ) {
        return false;
      }

      return true;
    });
  }, [rows, search, balanceStatus]);

  const handleExport = async (type: "pdf" | "excel") => {
    try {
      setExporting(type);
      const res = await api.get(`/api/v1/reports/partner-ledger/export`, {
        params: { format: type },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `partner-ledger-report.${type === "excel" ? "xlsx" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading report...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Partner Ledger Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial position across all partners
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {exporting === "excel" ? "Exporting..." : "Excel"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting === "pdf" ? "Exporting..." : "PDF"}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partner"
          className="border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={balanceStatus}
          onChange={(e) => setBalanceStatus(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Balances</option>
          <option value="OUTSTANDING">Outstanding</option>
          <option value="SETTLED">Fully Settled</option>
          <option value="EXCEEDED">Credit Exceeded</option>
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
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Partner</th>
                <th className="border p-3 text-right">Total Charges</th>
                <th className="border p-3 text-right">Total Settlements</th>
                <th className="border p-3 text-right">Outstanding</th>
                <th className="border p-3 text-right">Credit Limit</th>
                <th className="border p-3 text-right">Available Credit</th>
                <th className="border p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const exceeded =
                  r.creditLimit !== null && r.outstanding > r.creditLimit;

                return (
                  <tr key={r.partnerId} className="border-b hover:bg-gray-50">
                    <td className="border p-3">
                      <Link
                        href={`/staff/partners/${r.partnerId}/ledger`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {r.companyName}
                      </Link>
                      <div className="text-xs text-gray-400 font-mono">
                        {r.trackingPrefix}
                      </div>
                    </td>
                    <td className="border p-3 text-right">
                      $ {formatAmount(r.totalCharges)}
                    </td>
                    <td className="border p-3 text-right text-green-600">
                      $ {formatAmount(r.totalSettlements)}
                    </td>
                    <td className="border p-3 text-right font-semibold text-red-600">
                      $ {formatAmount(r.outstanding)}
                    </td>
                    <td className="border p-3 text-right">
                      {r.creditLimit !== null
                        ? `$ ${formatAmount(r.creditLimit)}`
                        : "No limit"}
                    </td>
                    <td className="border p-3 text-right">
                      {r.availableCredit !== null
                        ? `$ ${formatAmount(r.availableCredit)}`
                        : "-"}
                    </td>
                    <td className="border p-3 text-center">
                      {!r.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                          Inactive
                        </span>
                      ) : exceeded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          <AlertTriangle size={12} /> Over Limit
                        </span>
                      ) : r.outstanding > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Outstanding
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No partners match the selected filters.
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

export default StaffPartnerLedgerReportPage;
