"use client";

import api from "@/lib/axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   TYPES
============================================================ */

type ShipmentMode = "AIR" | "SEA";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD";
type TabKey = "OVERVIEW" | "RATES" | "LEDGER" | "SETTLEMENTS" | "EMPLOYEES";

interface IPartner {
  id: string;
  companyName: string;
  slug: string;
  trackingPrefix: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  creditLimit?: number | string | null;
}

interface IPartnerRate {
  id: string;
  mode: ShipmentMode;
  destination: string;
  ratePerKg: number | string;
  minChargeableKg?: number | string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
}

interface ILedgerEntry {
  id: string;
  description: string;
  debit: number | string;
  credit: number | string;
  runningBalance: number | string;
  createdAt: string;
  shipment?: { trackingNumber: string } | null;
}

interface ILedgerSummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  creditLimit: number | null;
}

interface ISettlement {
  id: string;
  amount: number | string;
  method: PaymentMethod;
  transactionRef?: string | null;
  note?: string | null;
  status: string;
  settledAt: string;
  recordedBy?: { fullName: string } | null;
}

interface IEmployee {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
}

/* ============================================================
   COMPONENT
============================================================ */

const PartnerProfilePage = () => {
  const router = useRouter();
  const params = useParams();

  const partnerId =
    typeof params.partnerId === "string" ? params.partnerId : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");

  const [partner, setPartner] = useState<IPartner | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(true);

  const [rates, setRates] = useState<IPartnerRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  const [summary, setSummary] = useState<ILedgerSummary | null>(null);
  const [entries, setEntries] = useState<ILedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const [settlements, setSettlements] = useState<ISettlement[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const formatMoney = (val: number | string) =>
    Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ==========================================================
     LOAD PARTNER (OVERVIEW)
  ========================================================== */

  useEffect(() => {
    if (!partnerId) return;

    (async () => {
      try {
        setLoadingPartner(true);
        const res = await api.get(`/api/v1/partner/${partnerId}`);
        setPartner(res.data?.data ?? null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load partner");
      } finally {
        setLoadingPartner(false);
      }
    })();
  }, [partnerId]);

  /* ==========================================================
     LOAD RATES
  ========================================================== */

  const loadRates = async () => {
    if (!partnerId) return;
    try {
      setLoadingRates(true);
      const res = await api.get(`/api/v1/partner/${partnerId}/rates`);
      setRates(res.data?.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load rates");
    } finally {
      setLoadingRates(false);
    }
  };

  /* ==========================================================
     LOAD LEDGER
  ========================================================== */

  const loadLedger = async () => {
    if (!partnerId) return;
    try {
      setLoadingLedger(true);
      const res = await api.get(`/api/v1/partner-ledger/${partnerId}`);
      const data = res.data?.data;
      setSummary(data?.summary ?? null);
      setEntries(data?.entries ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load ledger");
    } finally {
      setLoadingLedger(false);
    }
  };

  /* ==========================================================
     LOAD SETTLEMENTS
  ========================================================== */

  const loadSettlements = async () => {
    if (!partnerId) return;
    try {
      setLoadingSettlements(true);
      const res = await api.get(
        `/api/v1/partner-ledger/settlements?partnerId=${partnerId}`,
      );
      setSettlements(res.data?.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load settlements");
    } finally {
      setLoadingSettlements(false);
    }
  };

  /* ==========================================================
     LOAD EMPLOYEES
  ========================================================== */

  const loadEmployees = async () => {
    if (!partnerId) return;
    try {
      setLoadingEmployees(true);
      const res = await api.get(`/api/v1/partner/${partnerId}/employees`);
      setEmployees(res.data?.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  /* ==========================================================
     TAB SWITCH — LAZY LOAD
  ========================================================== */

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);

    if (tab === "RATES" && rates.length === 0) loadRates();
    if (tab === "LEDGER" && !summary) loadLedger();
    if (tab === "SETTLEMENTS" && settlements.length === 0) loadSettlements();
    if (tab === "EMPLOYEES" && employees.length === 0) loadEmployees();
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "OVERVIEW", label: "Overview" },
    { key: "RATES", label: "Wholesale Rates" },
    { key: "LEDGER", label: "Ledger" },
    { key: "SETTLEMENTS", label: "Settlements" },
    { key: "EMPLOYEES", label: "Employees" },
  ];

  const creditLimitExceeded =
    summary?.creditLimit != null && summary.balance > summary.creditLimit;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* BACK */}
      <button
        onClick={() => router.push("/superadmin/partners")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to partners
      </button>

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        {loadingPartner ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="animate-spin" size={18} />
            Loading partner...
          </div>
        ) : partner ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {partner.companyName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Slug: {partner.slug} &nbsp;•&nbsp; Prefix:{" "}
                {partner.trackingPrefix}
              </p>
            </div>

            <span
              className={
                partner.isActive
                  ? "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit"
                  : "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 w-fit"
              }
            >
              {partner.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <p className="text-gray-400">Partner not found.</p>
        )}
      </div>

      {/* CREDIT LIMIT ALERT — সব ট্যাবেই দেখা যাবে, লোড হলে */}
      {creditLimitExceeded && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          ⚠ Outstanding balance ({formatMoney(summary!.balance)}) has exceeded
          the credit limit ({formatMoney(summary!.creditLimit!)}).
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-secondary text-secondary"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==========================================================
          TAB: OVERVIEW
      ========================================================== */}

      {activeTab === "OVERVIEW" && partner && (
        <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm text-gray-800">{partner.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Phone</p>
            <p className="text-sm text-gray-800">{partner.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Address</p>
            <p className="text-sm text-gray-800">{partner.address ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
            <p className="text-sm text-gray-800">
              {partner.creditLimit != null
                ? formatMoney(partner.creditLimit)
                : "No limit"}
            </p>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB: RATES
      ========================================================== */}

      {activeTab === "RATES" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wholesale Rates</h3>
            <span className="text-sm text-gray-500">
              {rates.length} rate{rates.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingRates ? (
            <div className="text-center py-10 text-gray-400">
              Loading rates...
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No rates set yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="border p-3 text-left">Mode</th>
                    <th className="border p-3 text-left">Destination</th>
                    <th className="border p-3 text-right">Rate / Kg</th>
                    <th className="border p-3 text-right">Min Kg</th>
                    <th className="border p-3 text-left">From</th>
                    <th className="border p-3 text-left">To</th>
                    <th className="border p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr
                      key={rate.id}
                      className="odd:bg-gray-50 hover:bg-gray-100"
                    >
                      <td className="border p-3 font-medium">{rate.mode}</td>
                      <td className="border p-3">{rate.destination}</td>
                      <td className="border p-3 text-right">
                        {rate.ratePerKg}
                      </td>
                      <td className="border p-3 text-right">
                        {rate.minChargeableKg ?? "-"}
                      </td>
                      <td className="border p-3">
                        {formatDate(rate.effectiveFrom)}
                      </td>
                      <td className="border p-3">
                        {formatDate(rate.effectiveTo)}
                      </td>
                      <td className="border p-3 text-center">
                        <span
                          className={
                            rate.isActive
                              ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                              : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                          }
                        >
                          {rate.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            নতুন রেট যোগ করতে চাইলে dedicated Rates page ব্যবহার করুন — ফর্মটা
            এখানে সংক্ষিপ্ত রাখা হয়েছে।
          </p>
        </div>
      )}

      {/* ==========================================================
          TAB: LEDGER
      ========================================================== */}

      {activeTab === "LEDGER" && (
        <div>
          {loadingLedger ? (
            <div className="text-center py-10 text-gray-400">
              Loading ledger...
            </div>
          ) : summary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow">
                  <p className="text-xs text-gray-500 mb-1">Total Debit</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatMoney(summary.totalDebit)}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                  <p className="text-xs text-gray-500 mb-1">Total Credit</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatMoney(summary.totalCredit)}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                  <p className="text-xs text-gray-500 mb-1">Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      summary.balance > 0 ? "text-red-600" : "text-gray-400"
                    }`}
                  >
                    {formatMoney(summary.balance)}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                  <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
                  <p className="text-xl font-bold text-gray-800">
                    {summary.creditLimit != null
                      ? formatMoney(summary.creditLimit)
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Ledger Entries</h3>
                  <span className="text-sm text-gray-500">
                    {entries.length} entr
                    {entries.length !== 1 ? "ies" : "y"}
                  </span>
                </div>

                {entries.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">
                    No ledger entries yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-secondary text-white">
                        <tr>
                          <th className="border p-3 text-left">Description</th>
                          <th className="border p-3 text-left">Shipment</th>
                          <th className="border p-3 text-right">Debit</th>
                          <th className="border p-3 text-right">Credit</th>
                          <th className="border p-3 text-right">Balance</th>
                          <th className="border p-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="odd:bg-gray-50 hover:bg-gray-100"
                          >
                            <td className="border p-3">{entry.description}</td>
                            <td className="border p-3">
                              {entry.shipment?.trackingNumber ?? "-"}
                            </td>
                            <td className="border p-3 text-right text-red-600">
                              {Number(entry.debit) > 0
                                ? formatMoney(entry.debit)
                                : "-"}
                            </td>
                            <td className="border p-3 text-right text-green-600">
                              {Number(entry.credit) > 0
                                ? formatMoney(entry.credit)
                                : "-"}
                            </td>
                            <td className="border p-3 text-right font-medium">
                              {formatMoney(entry.runningBalance)}
                            </td>
                            <td className="border p-3">
                              {formatDate(entry.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  সেটেলমেন্ট রেকর্ড করতে dedicated Ledger page ব্যবহার করুন।
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-sm text-gray-400">
              No ledger data.
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB: SETTLEMENTS
      ========================================================== */}

      {activeTab === "SETTLEMENTS" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Settlement History</h3>
            <span className="text-sm text-gray-500">
              {settlements.length} settlement
              {settlements.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingSettlements ? (
            <div className="text-center py-10 text-gray-400">
              Loading settlements...
            </div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No settlements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="border p-3 text-left">Date</th>
                    <th className="border p-3 text-left">Method</th>
                    <th className="border p-3 text-left">Ref</th>
                    <th className="border p-3 text-left">Note</th>
                    <th className="border p-3 text-right">Amount</th>
                    <th className="border p-3 text-left">Recorded By</th>
                    <th className="border p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.id} className="odd:bg-gray-50 hover:bg-gray-100">
                      <td className="border p-3">{formatDate(s.settledAt)}</td>
                      <td className="border p-3">{s.method}</td>
                      <td className="border p-3">{s.transactionRef ?? "-"}</td>
                      <td className="border p-3">{s.note ?? "-"}</td>
                      <td className="border p-3 text-right font-medium text-green-600">
                        {formatMoney(s.amount)}
                      </td>
                      <td className="border p-3">
                        {s.recordedBy?.fullName ?? "-"}
                      </td>
                      <td className="border p-3 text-center">
                        <span
                          className={
                            s.status === "VOIDED"
                              ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                              : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB: EMPLOYEES
      ========================================================== */}

      {activeTab === "EMPLOYEES" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Partner Employees</h3>
            <span className="text-sm text-gray-500">
              {employees.length} employee{employees.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingEmployees ? (
            <div className="text-center py-10 text-gray-400">
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No employees added yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="border p-3 text-left">Name</th>
                    <th className="border p-3 text-left">Email</th>
                    <th className="border p-3 text-left">Phone</th>
                    <th className="border p-3 text-left">Role</th>
                    <th className="border p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id} className="odd:bg-gray-50 hover:bg-gray-100">
                      <td className="border p-3 font-medium">{e.fullName}</td>
                      <td className="border p-3">{e.email}</td>
                      <td className="border p-3">{e.phone ?? "-"}</td>
                      <td className="border p-3">{e.role}</td>
                      <td className="border p-3 text-center">
                        <span
                          className={
                            e.status === "ACTIVE"
                              ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                              : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                          }
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerProfilePage;
