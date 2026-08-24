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
import {
  Ban,
  Banknote,
  Building2,
  CreditCard,
  Download,
  FileSpreadsheet,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /staff/reports/payments
   "Customer Payment Report" - platform-wide reporting UI
============================================================ */

const StaffPaymentReportPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const [partnerFilter, setPartnerFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatusT>(
    "ALL",
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, partnersRes] = await Promise.all([
        api.get("/api/v1/payment", {
          params: {
            ...(partnerFilter !== "ALL" ? { partnerId: partnerFilter } : {}),
            ...(methodFilter !== "ALL" ? { method: methodFilter } : {}),
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            ...(dateFrom ? { dateFrom } : {}),
            ...(dateTo ? { dateTo } : {}),
          },
        }),
        api.get("/api/v1/partner"),
      ]);
      const { data, meta } = paymentsRes.data;
      setPayments(data ?? []);
      setPartners(partnersRes.data?.data ?? []);
    } catch (error: any) {
      console.error("Failed to fetch report data:", error);
      toast.error(error?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerFilter, methodFilter, statusFilter, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    if (!customerSearch.trim()) return payments;
    const term = customerSearch.trim().toLowerCase();
    return payments.filter((p) =>
      p.shipment?.customer?.fullName?.toLowerCase().includes(term),
    );
  }, [payments, customerSearch]);

  const summary = useMemo(() => {
    const confirmed = filtered.filter((p) => !p.isVoided);
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const byMethod = (method: PaymentMethod) =>
      confirmed
        .filter((p) => p.method === method)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      total: confirmed.reduce((sum, p) => sum + Number(p.amount), 0),
      today: confirmed
        .filter((p) => new Date(p.paidAt).toDateString() === today)
        .reduce((sum, p) => sum + Number(p.amount), 0),
      thisMonth: confirmed
        .filter((p) => {
          const d = new Date(p.paidAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0),
      cash: byMethod("CASH"),
      stripe: byMethod("STRIPE"),
      bankTransfer: byMethod("BANK_TRANSFER"),
      mobileBanking: byMethod("MOBILE_BANKING"),
      voided: filtered
        .filter((p) => p.isVoided)
        .reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }, [filtered]);

  const handleExport = async (type: "pdf" | "excel") => {
    try {
      setExporting(type);
      const res = await api.get(`/api/v1/reports/payments/export`, {
        params: {
          format: type,
          ...(partnerFilter !== "ALL" ? { partnerId: partnerFilter } : {}),
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
        `payment-report.${type === "excel" ? "xlsx" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
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
            Customer Payment Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide customer payment summary and export
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <SummaryCard
          label="Total Customer Payments"
          value={summary.total}
          icon={<Wallet size={20} />}
          color="green"
        />
        <SummaryCard
          label="Today's Payments"
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
        <SummaryCard
          label="Voided"
          value={summary.voided}
          icon={<Ban size={20} />}
          color="red"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Cash"
          value={summary.cash}
          icon={<Banknote size={20} />}
          color="gray"
        />
        <SummaryCard
          label="Stripe"
          value={summary.stripe}
          icon={<CreditCard size={20} />}
          color="gray"
        />
        <SummaryCard
          label="Bank Transfer"
          value={summary.bankTransfer}
          icon={<Building2 size={20} />}
          color="gray"
        />
        <SummaryCard
          label="Mobile Banking"
          value={summary.mobileBanking}
          icon={<Smartphone size={20} />}
          color="gray"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
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
          <option value="PENDING">Pending</option>
          <option value="VOIDED">Voided</option>
        </select>
        <input
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Search customer"
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* REPORT TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Partner</th>
                <th className="border p-3 text-left">Tracking</th>
                <th className="border p-3 text-left">Customer</th>
                <th className="border p-3 text-right">Amount</th>
                <th className="border p-3 text-left">Method</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-left">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {formatDate(p.paidAt)}
                  </td>
                  <td className="border p-3">
                    {p.shipment?.partner?.companyName ?? "-"}
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

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
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

export default StaffPaymentReportPage;
