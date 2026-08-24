"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { RootState } from "@/Redux/store";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD";
type UserType = "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";

interface IAuthUser {
  id: string;
  role?: string;
  userType?: UserType;
  partnerId?: string | null;
}

interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix?: string;
  creditLimit?: number | string | null;
  isActive?: boolean;
}

interface IPartnerListItem {
  id: string;
  companyName: string;
  trackingPrefix: string;
  isActive: boolean;
  creditLimit?: number | string | null;
  _count?: {
    customers: number;
    shipments: number;
    employees: number;
    wholesaleRates: number;
  };
}

interface ILedgerEntry {
  id: string;
  description: string;
  debit: number | string;
  credit: number | string;
  runningBalance: number | string;
  createdAt: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    status?: string;
  } | null;
}

interface ILedgerSummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  creditLimit: number | null;
}

interface SettlementForm {
  amount: string;
  method: PaymentMethod;
  transactionRef: string;
  description: string;
}

const emptySettlementForm: SettlementForm = {
  amount: "",
  method: "CASH",
  transactionRef: "",
  description: "",
};

/* ============================================================
   COMPONENT
============================================================ */

const PartnerLedgerPage = () => {
  const router = useRouter();

  /* ==========================================================
     AUTH
  ========================================================== */

  const user = useSelector(
    (state: RootState) => state.auth.user as IAuthUser | null,
  );

  const isGilbriceStaff = user?.userType === "GILBRICE_STAFF";
  const isPartnerEmployee = user?.userType === "PARTNER_EMPLOYEE";

  /* ==========================================================
     STATE
  ========================================================== */

  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  // Searchable partner picker (staff only)
  const [partnersList, setPartnersList] = useState<IPartnerListItem[]>([]);
  const [loadingPartnersList, setLoadingPartnersList] = useState(false);
  const [partnerSearchText, setPartnerSearchText] = useState("");
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);

  const [partner, setPartner] = useState<IPartner | null>(null);
  const [summary, setSummary] = useState<ILedgerSummary | null>(null);
  const [entries, setEntries] = useState<ILedgerEntry[]>([]);

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const [form, setForm] = useState<SettlementForm>(emptySettlementForm);
  const [error, setError] = useState<string | null>(null);

  /* ==========================================================
     EMPLOYEE: OWN PARTNER ID DIRECTLY
  ========================================================== */

  const ownPartnerId = useMemo(() => {
    if (isPartnerEmployee) return user?.partnerId ?? undefined;
    return undefined;
  }, [isPartnerEmployee, user?.partnerId]);

  /* ==========================================================
     LOAD PARTNERS LIST (STAFF — for searchable picker)
  ========================================================== */

  const loadPartnersList = async () => {
    try {
      setLoadingPartnersList(true);

      const res = await api.get(`/api/v1/partner`, {
        params: { isActive: true },
      });

      setPartnersList(res.data?.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load partners list",
      );
    } finally {
      setLoadingPartnersList(false);
    }
  };

  useEffect(() => {
    if (isGilbriceStaff) {
      loadPartnersList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGilbriceStaff]);

  const filteredPartners = useMemo(() => {
    const term = partnerSearchText.trim().toLowerCase();

    if (!term) return partnersList;

    return partnersList.filter(
      (p) =>
        p.companyName.toLowerCase().includes(term) ||
        p.trackingPrefix?.toLowerCase().includes(term),
    );
  }, [partnersList, partnerSearchText]);

  const handleSelectPartner = (p: IPartnerListItem) => {
    setPartnerSearchText(p.companyName);
    setShowPartnerDropdown(false);
    loadLedger(p.id);
  };

  /* ==========================================================
     LOAD LEDGER
  ========================================================== */

  const loadLedger = async (partnerId: string) => {
    if (!partnerId.trim()) {
      setError("Partner ID is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.get(`/api/v1/partner-ledger/${partnerId}`);

      const data = res.data?.data;

      setPartner(data?.partner ?? null);
      setSummary(data?.summary ?? null);
      setEntries(data?.entries ?? []);

      setActivePartnerId(partnerId);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load partner ledger";

      setError(message);
      toast.error(message);

      setPartner(null);
      setSummary(null);
      setEntries([]);
      setActivePartnerId(null);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     EMPLOYEE: AUTO LOAD OWN LEDGER
  ========================================================== */

  useEffect(() => {
    if (isPartnerEmployee && ownPartnerId) {
      loadLedger(ownPartnerId);
    } else if (user) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPartnerEmployee, ownPartnerId, user]);

  /* ==========================================================
     RECORD SETTLEMENT (STAFF ONLY)
  ========================================================== */

  const handleRecordSettlement = async () => {
    if (!isGilbriceStaff) return; // extra guard

    setError(null);

    if (!activePartnerId) {
      setError("Search a partner first");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Settlement amount must be greater than zero");
      return;
    }

    if (summary && Number(form.amount) > summary.balance) {
      setError(
        `Amount cannot exceed outstanding balance of ${summary.balance}`,
      );
      return;
    }

    const payload = {
      partnerId: activePartnerId,
      amount: Number(form.amount),
      method: form.method,
      transactionRef: form.transactionRef.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    setRecording(true);

    try {
      const res = await api.post(`/api/v1/partner-ledger/settlement`, payload);

      const result = res.data?.data;

      if (result?.ledgerEntry) {
        setEntries((prev) => [result.ledgerEntry, ...prev]);
      }

      if (typeof result?.balance === "number") {
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                totalCredit: prev.totalCredit + Number(form.amount),
                balance: result.balance,
              }
            : prev,
        );
      }

      setForm(emptySettlementForm);
      toast.success("Settlement recorded successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to record settlement";

      setError(message);
      toast.error(message);
    } finally {
      setRecording(false);
    }
  };

  /* ==========================================================
     FORMAT HELPERS
  ========================================================== */

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (val: number | string) =>
    Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* BACK — শুধু staff এর জন্য */}
      {isGilbriceStaff && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isGilbriceStaff ? "Partner Ledger" : "My Ledger"}
      </h2>

      {/* ======================================================
          PARTNER SEARCH — শুধু staff এর জন্য
          (employee এর partnerId নিজে থেকেই লোড হয়ে যায়)
      ====================================================== */}

      {isGilbriceStaff && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Find Partner</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                className="pl-9"
                value={partnerSearchText}
                onChange={(e) => {
                  setPartnerSearchText(e.target.value);
                  setShowPartnerDropdown(true);
                }}
                onFocus={() => setShowPartnerDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowPartnerDropdown(false), 150)
                }
                placeholder="Search partner by name..."
              />
            </div>

            {showPartnerDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {loadingPartnersList ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    Loading partners...
                  </div>
                ) : filteredPartners.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No partners found.
                  </div>
                ) : (
                  filteredPartners.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPartner(p)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {p.companyName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.trackingPrefix} · {p._count?.shipments ?? 0}{" "}
                          shipments
                        </p>
                      </div>

                      <span
                        className={
                          p.isActive
                            ? "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 shrink-0"
                            : "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 shrink-0"
                        }
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {loading && (
            <p className="text-xs text-gray-400 mt-2">Loading ledger...</p>
          )}
        </div>
      )}

      {/* Employee এর জন্য error (auto-load ব্যর্থ হলে) */}
      {isPartnerEmployee && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {isPartnerEmployee && loading && (
        <div className="text-center py-10 text-gray-400">Loading ledger...</div>
      )}

      {summary && (
        <>
          {/* ====================================================
              PARTNER INFO — staff দেখবে
          ==================================================== */}

          {isGilbriceStaff && partner && (
            <div className="bg-white p-5 rounded-xl shadow mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {partner.companyName}
                  </p>
                  {partner.trackingPrefix && (
                    <p className="text-sm text-gray-500">
                      Prefix: {partner.trackingPrefix}
                    </p>
                  )}
                </div>

                <span
                  className={
                    partner.isActive
                      ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit"
                      : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 w-fit"
                  }
                >
                  {partner.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}

          {/* ====================================================
              SUMMARY CARDS
          ==================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
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
                {summary.creditLimit !== null
                  ? formatMoney(summary.creditLimit)
                  : "-"}
              </p>
            </div>
          </div>

          {/* ====================================================
              RECORD SETTLEMENT — শুধু GILBRICE_STAFF এর জন্য
          ==================================================== */}

          {isGilbriceStaff && summary.balance > 0 && (
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-lg font-semibold mb-5">
                Record a Settlement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Amount
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Method
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.method}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        method: e.target.value as PaymentMethod,
                      }))
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MOBILE_BANKING">Mobile Banking</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Transaction Ref (optional)
                  </label>
                  <Input
                    value={form.transactionRef}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        transactionRef: e.target.value,
                      }))
                    }
                    placeholder="SETL-20260823-001"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Description (optional)
                  </label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Monthly settlement"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <Button onClick={handleRecordSettlement} disabled={recording}>
                  {recording ? "Recording..." : "Record Settlement"}
                </Button>
              </div>
            </div>
          )}

          {/* ====================================================
              LEDGER ENTRIES
          ==================================================== */}

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ledger Entries</h3>
              <span className="text-sm text-gray-500">
                {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">No ledger entries yet.</p>
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
                      <th className="border p-3 text-right">Running Balance</th>
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
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerLedgerPage;
