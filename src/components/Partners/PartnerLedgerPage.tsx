"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { ArrowLeft, CreditCard, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_BANKING"
  | "CARD"
  | "ONLINE_GATEWAY"
  | "CHEQUE";

interface Partner {
  id: string;
  companyName: string;
  trackingPrefix: string;
  creditLimit: number | string | null;
  isActive: boolean;
}

interface LedgerEntry {
  id: string;
  partnerId: string;
  shipmentId: string | null;
  description: string;
  debit: number | string;
  credit: number | string;
  runningBalance: number | string;
  createdAt: string;

  partner: {
    id: string;
    companyName: string;
    trackingPrefix: string;
  };

  shipment: {
    id: string;
    trackingNumber: string;
    status: string;
    partnerCost: number | string;
  } | null;
}

const PartnerLedgerPage = () => {
  const router = useRouter();
  const params = useParams();

  const partnerId = params.partnerId as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Settlement modal
  const [showSettlement, setShowSettlement] = useState(false);
  const [settling, setSettling] = useState(false);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [description, setDescription] = useState("Partner settlement payment");

  /* ============================================================
     LOAD LEDGER
  ============================================================ */

  const fetchLedger = async () => {
    if (!partnerId) return;

    try {
      setRefreshing(true);

      const res = await api.get(`/api/v1/partner-ledger/${partnerId}`);

      console.log("PARTNER ID:", partnerId);
      console.log("FULL RESPONSE:", res.data);
      console.log("LEDGER DATA:", res.data.data);
      console.log("ENTRIES:", res.data.data?.entries);

      const ledgerData = res.data?.data;

      setEntries(Array.isArray(ledgerData?.entries) ? ledgerData.entries : []);

      if (ledgerData?.partner) {
        setPartner(ledgerData.partner);
      }
    } catch (error: any) {
      console.error("Failed to load partner ledger:", error);

      setEntries([]);
      setPartner(null);

      toast.error(
        error?.response?.data?.message || "Failed to load partner ledger",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("PARTNER ID FROM URL:", partnerId);

    if (partnerId) {
      fetchLedger();
    }
  }, [partnerId]);

  /* ============================================================
     SUMMARY
  ============================================================ */

  const totalDebit = entries.reduce(
    (sum, entry) => sum + Number(entry.debit),
    0,
  );

  const totalCredit = entries.reduce(
    (sum, entry) => sum + Number(entry.credit),
    0,
  );

  const currentBalance = totalDebit - totalCredit;

  /* ============================================================
     SETTLEMENT
  ============================================================ */

  const handleSettlement = async () => {
    const settlementAmount = Number(amount);

    if (!settlementAmount || settlementAmount <= 0) {
      toast.error("Enter a valid settlement amount");
      return;
    }

    if (settlementAmount > currentBalance) {
      toast.error(
        `Settlement cannot exceed outstanding balance of $${currentBalance.toFixed(
          2,
        )}`,
      );
      return;
    }

    if (!method) {
      toast.error("Payment method is required");
      return;
    }

    try {
      setSettling(true);

      await api.post("/api/v1/partner-ledger/settlement", {
        partnerId,
        amount: settlementAmount,
        method,
        transactionRef: transactionRef.trim() || undefined,
        description: description.trim() || "Partner settlement payment",
      });

      toast.success("Settlement recorded successfully");

      // Reset form
      setAmount("");
      setMethod("BANK_TRANSFER");
      setTransactionRef("");
      setDescription("Partner settlement payment");

      setShowSettlement(false);

      // Reload ledger
      await fetchLedger();
    } catch (error: any) {
      console.error("Settlement failed:", error);

      toast.error(
        error?.response?.data?.message || "Failed to record settlement",
      );
    } finally {
      setSettling(false);
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  //   if (loading) {
  //     return (
  //       <div className="max-w-6xl mx-auto py-10 px-4">
  //         <div className="text-center py-20 text-gray-500">
  //           Loading partner ledger...
  //         </div>
  //       </div>
  //     );
  //   }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* BACK */}
      <button
        onClick={() => router.push("/superadmin/partners")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Partners
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {partner?.companyName || "Partner"} — Ledger
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Tracking Prefix: {partner?.trackingPrefix || "-"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLedger} disabled={refreshing}>
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin mr-2" : "mr-2"}
            />
            Refresh
          </Button>

          <Button
            onClick={() => {
              if (currentBalance <= 0) {
                toast.error("There is no outstanding balance");
                return;
              }

              setAmount(currentBalance.toFixed(2));
              setShowSettlement(true);
            }}
            disabled={currentBalance <= 0}
          >
            <CreditCard size={16} className="mr-2" />
            Make Settlement
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Charges</p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            ${totalDebit.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total Settlements</p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            ${totalCredit.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Outstanding Balance</p>

          <p className="text-2xl font-bold text-orange-600 mt-2">
            ${currentBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Ledger Entries</h2>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No ledger entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-white">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Shipment</th>
                  <th className="p-3 text-right">Debit</th>
                  <th className="p-3 text-right">Credit</th>
                  <th className="p-3 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      <div className="font-medium">{entry.description}</div>

                      {entry.shipment && (
                        <div className="text-xs text-gray-400">
                          Shipment charge
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      {entry.shipment ? (
                        <span className="font-medium">
                          {entry.shipment.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">Settlement</span>
                      )}
                    </td>

                    <td className="p-3 text-right text-red-600">
                      {Number(entry.debit) > 0
                        ? `$${Number(entry.debit).toFixed(2)}`
                        : "-"}
                    </td>

                    <td className="p-3 text-right text-green-600">
                      {Number(entry.credit) > 0
                        ? `$${Number(entry.credit).toFixed(2)}`
                        : "-"}
                    </td>

                    <td className="p-3 text-right font-semibold">
                      ${Number(entry.runningBalance).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          SETTLEMENT MODAL
      ======================================================== */}

      {showSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Make Settlement</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Outstanding:{" "}
                  <span className="font-semibold text-orange-600">
                    ${currentBalance.toFixed(2)}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowSettlement(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* AMOUNT */}
              <div>
                <label className="text-sm font-medium">Settlement Amount</label>

                <Input
                  type="number"
                  min={0}
                  max={currentBalance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                />

                <p className="text-xs text-gray-400 mt-1">
                  Maximum: ${currentBalance.toFixed(2)}
                </p>
              </div>

              {/* METHOD */}
              <div>
                <label className="text-sm font-medium">Payment Method</label>

                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE_GATEWAY">Online Gateway</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {/* TRANSACTION REF */}
              <div>
                <label className="text-sm font-medium">
                  Transaction Reference
                </label>

                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="SETTLEMENT-0001"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium">Description</label>

                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Partner settlement payment"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSettlement(false)}
                disabled={settling}
              >
                Cancel
              </Button>

              <Button onClick={handleSettlement} disabled={settling}>
                {settling ? "Processing..." : "Submit Settlement"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerLedgerPage;
