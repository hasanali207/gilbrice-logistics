"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

type PaymentItem = {
  id: string;
  studentId: string;
  admissionId: string;
  sessionId: string;
  month: number;
  year: number;
  status: string;
  paidAmount: number;
  transactionId: string;
  items: {
    id: string;
    feeCategoryId: string;
    amount: number;
    status: string;
    feeCategory: { name: string };
  }[];
  session: { id: string; name: string };
};

const statusStyle: Record<string, { badge: string; label: string }> = {
  PAID: { badge: "bg-emerald-100 text-emerald-700", label: "পরিশোধ" },
  PARTIAL: { badge: "bg-amber-100 text-amber-700", label: "আংশিক" },
  PENDING: { badge: "bg-red-100 text-red-600", label: "বাকি" },
  UNPAID: { badge: "bg-red-100 text-red-600", label: "বাকি" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusStyle[status] ?? {
    badge: "bg-slate-100 text-slate-600",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}
    >
      {status === "PAID" ? "✓" : status === "PARTIAL" ? "~" : "✗"} {cfg.label}
    </span>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────────
function PaymentCard({
  p,
  idx,
  onPay,
}: {
  p: PaymentItem;
  idx: number;
  onPay: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = p.items.reduce((s, i) => s + i.amount, 0);
  const isPaid = p.status === "PAID";

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isPaid ? "border-emerald-100" : "border-red-100"}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isPaid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
          >
            {idx + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {p.month} {p.year}
            </p>
            <p className="text-xs text-slate-400">{p.session?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 tabular-nums">
              ${total.toLocaleString()}
            </p>
            <p
              className={`text-xs font-bold ${isPaid ? "text-emerald-600" : "text-red-500"}`}
            >
              {isPaid ? "পরিশোধ হয়েছে" : "বাকি আছে"}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Fee Breakdown
          </p>
          {p.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-600">
                {item.feeCategory?.name || "Unknown Fee"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  ${item.amount}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "PARTIAL"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status === "PAID"
                    ? "পরিশোধ"
                    : item.status === "PARTIAL"
                      ? "আংশিক"
                      : "বাকি"}
                </span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
            <span className="text-sm font-black text-slate-700">মোট</span>
            <span className="text-sm font-black text-slate-800">
              ${total.toLocaleString()}
            </span>
          </div>
          {p.status === "PENDING" && (
            <button
              onClick={() => onPay(p.id)}
              className="mt-1 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
            >
              এখনই পরিশোধ করুন
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function StudentPaymentPage() {
  const token = useSelector((state: any) => state.auth.token);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_API}/api/v1/payment/student/me`, {
      headers: { Authorization: `${token}` },
    })
      .then((r) => r.json())
      .then((json) => setPayments(Array.isArray(json.data) ? json.data : []))
      .catch(() => toast.error("Failed to fetch payments"))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/api/v1/payment/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ id }),
        },
      );
      const json = await res.json();
      if (json.success && json.data?.paymentUrl) {
        window.location.href = json.data.paymentUrl;
      } else {
        toast.error(
          "অনলাইন পেমেন্ট নিয়ে কাজ চলমান অপেক্ষা করুন। বর্তমানে অফিসে এসে পেমেন্ট করতে হবে।",
        );
      }
    } catch {
      toast.error(
        "অনলাইন পেমেন্ট নিয়ে কাজ চলমান অপেক্ষা করুন। বর্তমানে অফিসে এসে পেমেন্ট করতে হবে",
      );
    }
  };

  if (!mounted) return null;

  // ── Stats ──
  const unpaidAmount = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + p.items.reduce((a, i) => a + i.amount, 0), 0);
  const unpaidMonths = payments.filter((p) => p.status !== "PAID").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              My Payments
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Academic year {new Date().getFullYear()} · {payments.length}{" "}
              records
            </p>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4  ">
          {/* Unpaid */}
          <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-red-50/60" />
            <p className="text-lg  text-slate-400 uppercase tracking-widest">
              বাকি আছে
            </p>
            <p className="text-2xl    text-red-500 tabular-nums mt-1">
              {unpaidAmount.toLocaleString()} টাকা
            </p>
            <p className="text-sm   text-slate-400 mt-1">
              {unpaidMonths} মাস বাকি
            </p>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center gap-2 justify-center py-16 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Loading…
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && payments.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            No payment records found.
          </div>
        )}

        {/* ── Desktop Table ── */}
        {!loading && payments.length > 0 && (
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm  ">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                সকল পেমেন্ট
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "#",
                    "Session",
                    "Month / Year",
                    "Fee Breakdown",
                    "Total",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p, idx) => {
                  const total = p.items.reduce((s, i) => s + i.amount, 0);
                  const isPaid = p.status === "PAID";
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="**:w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium max-w-[160px]">
                        <span className="line-clamp-2 text-sm leading-snug">
                          {p.session?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">
                          {p.month}
                        </p>
                        <p className="text-xs text-slate-400">{p.year}</p>
                      </td>
                      <td className="px-5 py-4 min-w-[220px]">
                        <div className="space-y-1.5">
                          {p.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="text-sm">
                                {item.feeCategory?.name || "Unknown"}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className=" tabular-nums">
                                  ${item.amount}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-xs  ${
                                    item.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : item.status === "PARTIAL"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {item.status === "PAID"
                                    ? "পরিশোধ"
                                    : item.status === "PARTIAL"
                                      ? "আংশিক"
                                      : "বাকি"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="tabular-nums">
                          ${total.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isPaid ? "" : "text-red-500"}`}
                        >
                          {isPaid ? "পরিশোধ" : "বাকি"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4">
                        {p.status === "PENDING" || p.status === "PARTIAL" ? (
                          <button
                            onClick={() => handlePay(p.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs  rounded-lg transition-colors shadow-sm shadow-emerald-200 cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs font-bold">
                            ✓ Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {!loading && payments.length > 0 && (
          <div className="md:hidden space-y-3">
            {payments.map((p, i) => (
              <PaymentCard key={p.id} p={p} idx={i} onPay={handlePay} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
