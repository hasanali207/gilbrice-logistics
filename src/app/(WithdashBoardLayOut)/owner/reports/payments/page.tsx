"use client";

import { MethodBadge, PaymentStatusBadge } from "@/components/Payments/Badges";
import api from "@/lib/axios";
import {
  IPayment,
  PaymentMethod,
  PaymentStatusT,
  formatAmount,
  formatDate,
} from "@/lib/types";
import {
  Banknote,
  Download,
  FileSpreadsheet,
  Globe2,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /partner/reports/payments
   "Customer Payment Report" - scoped to the logged-in
   partner only.
============================================================ */

const ONLINE_METHODS: PaymentMethod[] = ["STRIPE", "ONLINE_GATEWAY", "CARD"];

const PartnerPaymentReportPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatusT>(
    "ALL",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/payment", {
        params: {
          ...(methodFilter !== "ALL" ? { method: methodFilter } : {}),
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
      });
      const { data, meta } = res.data;
      setPayments(data ?? []);
    } catch (error: any) {
      console.error("Failed to fetch report:", error);
      toast.error(error?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodFilter, statusFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const confirmed = payments.filter((p) => !p.isVoided);
    const today = new Date().toDateString();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    return {
      totalCollected: confirmed.reduce((s, p) => s + Number(p.amount), 0),
      today: confirmed
        .filter((p) => new Date(p.paidAt).toDateString() === today)
        .reduce((s, p) => s + Number(p.amount), 0),
      thisMonth: confirmed
        .filter((p) => {
          const d = new Date(p.paidAt);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s, p) => s + Number(p.amount), 0),
      cash: confirmed
        .filter((p) => p.method === "CASH")
        .reduce((s, p) => s + Number(p.amount), 0),
      online: confirmed
        .filter((p) => ONLINE_METHODS.includes(p.method))
        .reduce((s, p) => s + Number(p.amount), 0),
      outstandingBalance: Array.from(
        new Map(
          payments.map((p) => [
            p.shipment.id,
            Number(p.shipment.customerBalance),
          ]),
        ).values(),
      ).reduce((s, v) => s + v, 0),
    };
  }, [payments]);

  const handleExport = async (type: "pdf" | "excel") => {
    try {
      setExporting(type);
      const res = await api.get("/api/v1/reports/payments/export", {
        params: {
          format: type,
          ...(methodFilter !== "ALL" ? { method: methodFilter } : {}),
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `my-payment-report.${type === "excel" ? "xlsx" : "pdf"}`,
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
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading report...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customer Payment Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your payment collection summary
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

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <SummaryCard
          label="Total Collected"
          value={summary.totalCollected}
          icon={<Wallet size={20} />}
          color="green"
        />
        <SummaryCard
          label="Today's Collection"
          value={summary.today}
          icon={<Wallet size={20} />}
          color="blue"
        />
        <SummaryCard
          label="This Month"
          value={summary.thisMonth}
          icon={<Wallet size={20} />}
          color="blue"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="Outstanding Customer Balance"
          value={summary.outstandingBalance}
          icon={<Wallet size={20} />}
          color="red"
        />
        <SummaryCard
          label="Cash"
          value={summary.cash}
          icon={<Banknote size={20} />}
          color="gray"
        />
        <SummaryCard
          label="Online"
          value={summary.online}
          icon={<Globe2 size={20} />}
          color="gray"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <option value="STRIPE">Stripe</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Tracking</th>
                <th className="border p-3 text-left">Customer</th>
                <th className="border p-3 text-right">Amount</th>
                <th className="border p-3 text-left">Method</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-left">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
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
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No payments match the selected filters.
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

const SummaryCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "red" | "gray";
}) => {
  const colorMap = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 border flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800 mt-1">
          $ {formatAmount(value)}
        </p>
      </div>
      <div className={`p-2.5 rounded-full ${colorMap[color]}`}>{icon}</div>
    </div>
  );
};

export default PartnerPaymentReportPage;
