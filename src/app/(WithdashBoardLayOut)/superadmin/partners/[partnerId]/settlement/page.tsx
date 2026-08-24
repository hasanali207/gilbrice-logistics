"use client";

import api from "@/lib/axios";
import {
  IPartner,
  PAYMENT_METHODS,
  PaymentMethod,
  formatAmount,
} from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   PAGE: /staff/partners/[partnerId]/settlement
   "Record Partner Settlement" - Partner -> Gilbrice payment.
   This is NOT a customer payment.
============================================================ */

interface ILedgerSummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  creditLimit: number | null;
  availableCredit: number | null;
}

const StaffRecordSettlementPage = () => {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();

  const [partner, setPartner] = useState<IPartner | null>(null);
  const [summary, setSummary] = useState<ILedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [description, setDescription] = useState("");
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/partner-ledger/${params.partnerId}`);
      const data = res.data?.data ?? {};
      setPartner(data.partner ?? null);
      setSummary(data.summary ?? null);
    } catch (error: any) {
      console.error("Failed to fetch partner ledger:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load partner information",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.partnerId) fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.partnerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid settlement amount");
      return;
    }

    if (summary && numericAmount > summary.balance) {
      toast.error(
        `Settlement amount cannot exceed outstanding balance of $${formatAmount(
          summary.balance,
        )}`,
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/v1/partner-ledger/settlement", {
        partnerId: params.partnerId,
        amount: numericAmount,
        method,
        transactionRef: transactionRef.trim() || undefined,
        description: description.trim() || undefined,
        settledAt: settlementDate,
      });

      toast.success("Settlement recorded successfully");
      router.push(`/staff/partners/${params.partnerId}/ledger`);
    } catch (error: any) {
      console.error("Failed to record settlement:", error);
      toast.error(
        error?.response?.data?.message || "Failed to record settlement",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading partner...
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center text-gray-500">
        Partner not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Record Partner Settlement
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Record a payment received from {partner.companyName} against their
        outstanding ledger balance.
      </p>

      {/* BALANCE SNAPSHOT */}
      <div className="bg-white rounded-xl shadow border p-5 mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Partner</p>
          <p className="font-semibold text-gray-800">{partner.companyName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Outstanding Balance</p>
          <p className="font-semibold text-red-600">
            $ {formatAmount(summary?.balance ?? 0)}
          </p>
        </div>
      </div>

      {summary && summary.balance <= 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 text-sm mb-6">
          This partner has no outstanding balance to settle.
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Reference
          </label>
          <input
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="Optional"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. August settlement"
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Settlement Date
          </label>
          <input
            type="date"
            value={settlementDate}
            onChange={(e) => setSettlementDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || (summary ? summary.balance <= 0 : false)}
          className="w-full bg-secondary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Recording..." : "Record Settlement"}
        </button>
      </form>
    </div>
  );
};

export default StaffRecordSettlementPage;
