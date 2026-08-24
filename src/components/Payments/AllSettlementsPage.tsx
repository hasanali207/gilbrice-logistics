"use client";

import api from "@/lib/axios";
import { RootState } from "@/Redux/store";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD";

type PaymentStatusT = "CONFIRMED" | "VOIDED" | "PENDING";

interface IPartner {
  id: string;
  companyName: string;
  trackingPrefix: string;
}

interface IPartnerListItem {
  id: string;
  companyName: string;
  trackingPrefix: string;
  isActive: boolean;
  _count?: {
    shipments: number;
  };
}

interface IStaff {
  id: string;
  fullName: string;
  email: string;
}

interface ISettlement {
  id: string;
  partner: IPartner;
  amount: string | number;
  method: PaymentMethod;
  transactionRef?: string | null;
  status: PaymentStatusT;
  recordedBy?: IStaff | null;
  description?: string | null;
  note?: string | null;
  settledAt: string;
  createdAt: string;
}

/* ============================================================
   COMPONENT
============================================================ */

const AllSettlementsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  /* ==========================================================
     SETTLEMENT DATA
  ========================================================== */

  const [settlements, setSettlements] = useState<ISettlement[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ==========================================================
     FILTERS
  ========================================================== */

  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );

  const [searchTerm, setSearchTerm] = useState("");

  /* ==========================================================
     PARTNER FILTER
  ========================================================== */

  const [partnersList, setPartnersList] = useState<IPartnerListItem[]>([]);

  const [loadingPartnersList, setLoadingPartnersList] = useState(false);

  const [partnerSearchText, setPartnerSearchText] = useState("");

  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);

  const [selectedPartner, setSelectedPartner] =
    useState<IPartnerListItem | null>(null);

  /* ==========================================================
     CREATE MODAL
  ========================================================== */

  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const [creatingSettlement, setCreatingSettlement] = useState(false);

  const [settlementForm, setSettlementForm] = useState({
    amount: "",
    method: "BANK_TRANSFER" as PaymentMethod,
    transactionRef: "",
    description: "",
  });

  /* ============================================================
     FETCH SETTLEMENTS
  ============================================================ */

  const fetchSettlements = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/api/v1/partner-ledger/settlements");

      setSettlements(res.data?.data ?? []);
    } catch (error: any) {
      console.error("Failed to fetch settlements:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load settlements",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ============================================================
     FETCH PARTNERS
  ============================================================ */

  const loadPartnersList = async () => {
    try {
      setLoadingPartnersList(true);

      const res = await api.get("/api/v1/partner");

      setPartnersList(res.data?.data ?? []);
    } catch (error: any) {
      console.error("Failed to load partners:", error);

      toast.error(error?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoadingPartnersList(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    fetchSettlements();
    loadPartnersList();
  }, []);

  /* ============================================================
     FILTER PARTNERS
  ============================================================ */

  const filteredPartners = useMemo(() => {
    const term = partnerSearchText.trim().toLowerCase();

    if (!term) {
      return partnersList;
    }

    return partnersList.filter(
      (partner) =>
        partner.companyName?.toLowerCase().includes(term) ||
        partner.trackingPrefix?.toLowerCase().includes(term),
    );
  }, [partnersList, partnerSearchText]);

  /* ============================================================
     SELECT PARTNER
  ============================================================ */

  const handleSelectPartner = (partner: IPartnerListItem) => {
    setSelectedPartner(partner);

    setPartnerSearchText(partner.companyName);

    setShowPartnerDropdown(false);
  };

  /* ============================================================
     CLEAR PARTNER
  ============================================================ */

  const clearPartnerFilter = () => {
    setSelectedPartner(null);
    setPartnerSearchText("");
  };

  /* ============================================================
     OPEN CREATE MODAL
  ============================================================ */

  const openSettlementModal = () => {
    setSettlementForm({
      amount: "",
      method: "BANK_TRANSFER",
      transactionRef: "",
      description: "",
    });

    setShowSettlementModal(true);
  };

  /* ============================================================
     CLOSE CREATE MODAL
  ============================================================ */

  const closeSettlementModal = () => {
    if (creatingSettlement) return;

    setShowSettlementModal(false);

    setSettlementForm({
      amount: "",
      method: "BANK_TRANSFER",
      transactionRef: "",
      description: "",
    });
  };

  /* ============================================================
     CREATE SETTLEMENT
  ============================================================ */

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartner) {
      toast.error("Please select a partner");
      return;
    }

    if (!settlementForm.amount || Number(settlementForm.amount) <= 0) {
      toast.error("Enter a valid settlement amount");
      return;
    }

    try {
      setCreatingSettlement(true);

      const payload = {
        partnerId: selectedPartner.id,

        amount: Number(settlementForm.amount),

        method: settlementForm.method,

        ...(settlementForm.transactionRef.trim() && {
          transactionRef: settlementForm.transactionRef.trim(),
        }),

        ...(settlementForm.description.trim() && {
          description: settlementForm.description.trim(),
        }),
      };

      const res = await api.post("/api/v1/partner-ledger/settlement", payload);
      console.log("SELECTED PARTNER:", selectedPartner);
      console.log("PARTNER ID:", selectedPartner?.id);
      toast.success(
        res.data?.message || "Partner settlement created successfully",
      );

      setShowSettlementModal(false);

      setSettlementForm({
        amount: "",
        method: "BANK_TRANSFER",
        transactionRef: "",
        description: "",
      });

      await fetchSettlements();
    } catch (error: any) {
      console.error("Create settlement error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create settlement",
      );
    } finally {
      setCreatingSettlement(false);
    }
  };

  /* ============================================================
     FILTER SETTLEMENTS
  ============================================================ */

  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      /* Partner */

      if (selectedPartner && settlement.partner?.id !== selectedPartner.id) {
        return false;
      }

      /* Method */

      if (methodFilter !== "ALL" && settlement.method !== methodFilter) {
        return false;
      }

      /* Search */

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();

        const partnerName = settlement.partner?.companyName
          ?.toLowerCase()
          .includes(term);

        const trackingPrefix = settlement.partner?.trackingPrefix
          ?.toLowerCase()
          .includes(term);

        const reference = settlement.transactionRef
          ?.toLowerCase()
          .includes(term);

        const recordedBy = settlement.recordedBy?.fullName
          ?.toLowerCase()
          .includes(term);

        const description = settlement.description
          ?.toLowerCase()
          .includes(term);

        if (
          !partnerName &&
          !trackingPrefix &&
          !reference &&
          !recordedBy &&
          !description
        ) {
          return false;
        }
      }

      return true;
    });
  }, [settlements, selectedPartner, methodFilter, searchTerm]);

  /* ============================================================
     SUMMARY
  ============================================================ */

  const summary = useMemo(() => {
    const validSettlements = settlements.filter(
      (settlement) => settlement.status !== "VOIDED",
    );

    const totalSettled = validSettlements.reduce(
      (sum, settlement) => sum + Number(settlement.amount),
      0,
    );

    const uniquePartners = new Set(
      validSettlements.map((settlement) => settlement.partner?.id),
    ).size;

    return {
      totalSettled,
      count: validSettlements.length,
      uniquePartners,
    };
  }, [settlements]);

  /* ============================================================
     FORMAT AMOUNT
  ============================================================ */

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* ============================================================
     PAYMENT METHOD LABEL
  ============================================================ */

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "BANK_TRANSFER":
        return "Bank Transfer";

      case "MOBILE_BANKING":
        return "Mobile Banking";

      case "CASH":
        return "Cash";

      case "CARD":
        return "Card";

      default:
        return method;
    }
  };

  /* ============================================================
     PAYMENT METHOD ICON
  ============================================================ */

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "BANK_TRANSFER":
        return <Building2 size={15} />;

      case "MOBILE_BANKING":
        return <Wallet2 size={15} />;

      case "CARD":
        return <CreditCard size={15} />;

      default:
        return <CircleDollarSign size={15} />;
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={19} className="animate-spin" />
          Loading settlements...
        </div>
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Wallet2 size={22} className="text-secondary" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Partner Settlements
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage and record payments made to partners.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}

              <button
                type="button"
                onClick={fetchSettlements}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              {/* New Settlement */}

              <button
                type="button"
                onClick={openSettlementModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              >
                <Plus size={17} />
                New Settlement
              </button>
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
            {/* Total */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Settled</p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatAmount(summary.totalSettled)}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
                  <Wallet2 size={21} className="text-green-600" />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Total confirmed settlement amount
              </p>
            </div>

            {/* Count */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Settlement Count</p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {summary.count}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BadgeCheck size={21} className="text-blue-600" />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Confirmed settlement transactions
              </p>
            </div>

            {/* Partners */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Partners Settled</p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {summary.uniquePartners}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ShieldCheck size={21} className="text-purple-600" />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Unique partners with settlements
              </p>
            </div>
          </div>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Partner */}

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Partner
                </label>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={partnerSearchText}
                    onChange={(e) => {
                      setPartnerSearchText(e.target.value);

                      if (selectedPartner) {
                        setSelectedPartner(null);
                      }

                      setShowPartnerDropdown(true);
                    }}
                    onFocus={() => setShowPartnerDropdown(true)}
                    placeholder="Search partner..."
                    className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-9 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />

                  {selectedPartner ? (
                    <button
                      type="button"
                      onClick={clearPartnerFilter}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>

                {showPartnerDropdown && (
                  <div className="absolute z-30 left-0 right-0 top-[74px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                    {loadingPartnersList ? (
                      <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-400">
                        <Loader2 size={15} className="animate-spin" />
                        Loading partners...
                      </div>
                    ) : filteredPartners.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-gray-400">
                        No partners found.
                      </div>
                    ) : (
                      filteredPartners.map((partner) => (
                        <button
                          key={partner.id}
                          type="button"
                          onClick={() => handleSelectPartner(partner)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {partner.companyName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {partner.trackingPrefix}
                            </p>
                          </div>

                          <span
                            className={
                              partner.isActive
                                ? "px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold"
                                : "px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold"
                            }
                          >
                            {partner.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Search */}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Search
                </label>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Reference, partner, staff..."
                    className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-4 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />
                </div>
              </div>

              {/* Method */}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Payment Method
                </label>

                <select
                  value={methodFilter}
                  onChange={(e) =>
                    setMethodFilter(e.target.value as "ALL" | PaymentMethod)
                  }
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                >
                  <option value="ALL">All Methods</option>

                  <option value="CASH">Cash</option>

                  <option value="BANK_TRANSFER">Bank Transfer</option>

                  <option value="MOBILE_BANKING">Mobile Banking</option>

                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Header */}

            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Settlement Transactions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {filteredSettlements.length} settlement
                  {filteredSettlements.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {selectedPartner && (
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary">
                  <Building2 size={14} />

                  {selectedPartner.companyName}
                </div>
              )}
            </div>

            {/* Table */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Partner
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Method
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Reference
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Recorded By
                    </th>

                    <th className="px-4 py-3 text-center font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSettlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      {/* Date */}

                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(settlement.settledAt)}
                        </p>
                      </td>

                      {/* Partner */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 size={16} className="text-gray-500" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {settlement.partner?.companyName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              {settlement.partner?.trackingPrefix}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Method */}

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-gray-700">
                          {getMethodIcon(settlement.method)}

                          {getMethodLabel(settlement.method)}
                        </span>
                      </td>

                      {/* Reference */}

                      <td className="px-4 py-4">
                        {settlement.transactionRef ? (
                          <span className="font-mono text-xs text-gray-700">
                            {settlement.transactionRef}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Description */}

                      <td className="px-4 py-4 max-w-[220px]">
                        <div className="flex items-start gap-2">
                          <FileText
                            size={15}
                            className="text-gray-400 mt-0.5 shrink-0"
                          />

                          <span className="text-gray-600 truncate">
                            {settlement.description ?? settlement.note ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}

                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-green-600">
                          {formatAmount(settlement.amount)}
                        </span>
                      </td>

                      {/* Recorded By */}

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-700">
                            {settlement.recordedBy?.fullName ?? "—"}
                          </p>

                          {settlement.recordedBy?.email && (
                            <p className="text-xs text-gray-400 mt-1">
                              {settlement.recordedBy.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-4 py-4 text-center">
                        <span
                          className={
                            settlement.status === "VOIDED"
                              ? "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500"
                              : settlement.status === "PENDING"
                                ? "inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700"
                                : "inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                          }
                        >
                          {settlement.status === "CONFIRMED" && (
                            <CheckCircle2 size={13} />
                          )}

                          {settlement.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Empty */}

                  {filteredSettlements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <Wallet2 size={24} className="text-gray-400" />
                          </div>

                          <p className="font-semibold text-gray-700">
                            No settlements found
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            Try changing your filters or create a new
                            settlement.
                          </p>

                          <button
                            type="button"
                            onClick={openSettlementModal}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            <Plus size={16} />
                            New Settlement
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CREATE SETTLEMENT MODAL
      ====================================================== */}

      {showSettlementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !creatingSettlement) {
              closeSettlementModal();
            }
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Wallet2 size={19} className="text-secondary" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Create Partner Settlement
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Record a payment made to a partner.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSettlementModal}
                disabled={creatingSettlement}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleCreateSettlement}>
              <div className="p-6 space-y-6">
                {/* Partner */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Partner <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={partnerSearchText}
                      onChange={(e) => {
                        setPartnerSearchText(e.target.value);

                        setSelectedPartner(null);

                        setShowPartnerDropdown(true);
                      }}
                      onFocus={() => setShowPartnerDropdown(true)}
                      placeholder="Search partner by company name or prefix..."
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                    />

                    {showPartnerDropdown && (
                      <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                        {loadingPartnersList ? (
                          <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-400">
                            <Loader2 size={16} className="animate-spin" />
                            Loading partners...
                          </div>
                        ) : filteredPartners.length === 0 ? (
                          <div className="px-4 py-4 text-sm text-gray-400">
                            No partners found.
                          </div>
                        ) : (
                          filteredPartners.map((partner) => (
                            <button
                              key={partner.id}
                              type="button"
                              onClick={() => handleSelectPartner(partner)}
                              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Building2
                                    size={16}
                                    className="text-gray-500"
                                  />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {partner.companyName}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1 font-mono">
                                    {partner.trackingPrefix}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={
                                  partner.isActive
                                    ? "rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700"
                                    : "rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500"
                                }
                              >
                                {partner.isActive ? "Active" : "Inactive"}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Partner */}

                  {selectedPartner && (
                    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-green-100">
                            <Building2 size={18} className="text-green-600" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {selectedPartner.companyName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Prefix:{" "}
                              <span className="font-mono">
                                {selectedPartner.trackingPrefix}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={13} />
                          Selected
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount + Method */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Amount */}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settlementForm.amount}
                        onChange={(e) =>
                          setSettlementForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="5000.00"
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-14 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Method */}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={settlementForm.method}
                      onChange={(e) =>
                        setSettlementForm((prev) => ({
                          ...prev,
                          method: e.target.value as PaymentMethod,
                        }))
                      }
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                    >
                      <option value="CASH">Cash</option>

                      <option value="BANK_TRANSFER">Bank Transfer</option>

                      <option value="MOBILE_BANKING">Mobile Banking</option>

                      <option value="CARD">Card</option>
                    </select>
                  </div>
                </div>

                {/* Transaction Reference */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction Reference
                  </label>

                  <input
                    value={settlementForm.transactionRef}
                    onChange={(e) =>
                      setSettlementForm((prev) => ({
                        ...prev,
                        transactionRef: e.target.value,
                      }))
                    }
                    placeholder="e.g. SETTLEMENT-0001"
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Bank/mobile transaction ID or internal settlement reference.
                  </p>
                </div>

                {/* Description */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={settlementForm.description}
                    onChange={(e) =>
                      setSettlementForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Partner settlement payment"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none resize-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />
                </div>

                {/* Summary */}

                {selectedPartner && settlementForm.amount && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                      Settlement Summary
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Partner</p>

                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {selectedPartner.companyName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Amount</p>

                        <p className="text-sm font-bold text-green-600 mt-1">
                          {formatAmount(settlementForm.amount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Method</p>

                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {getMethodLabel(settlementForm.method)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Reference</p>

                        <p className="text-sm font-mono font-medium text-gray-900 mt-1 truncate">
                          {settlementForm.transactionRef || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}

              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeSettlementModal}
                  disabled={creatingSettlement}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingSettlement ||
                    !selectedPartner ||
                    !settlementForm.amount
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-semibold text-white hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingSettlement ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wallet2 size={17} />
                      Create Settlement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AllSettlementsPage;
