"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { RootState } from "@/Redux/store";
import { ArrowLeft, Ban, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CARD";
type PaymentStatus = "CONFIRMED" | "VOIDED" | "PENDING";
type UserType = "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";

interface IAuthUser {
  id: string;
  role?: string;
  userType?: UserType;
  partnerId?: string | null;
}

interface IShipmentSummary {
  id: string;
  trackingNumber: string;
  finalCustomerAmount: number | string;
  amountPaidByCustomer: number | string;
  customerBalance: number | string;
  status?: string;
}

interface IPayment {
  id: string;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  paidAt: string;
  isVoided: boolean;
  voidReason?: string | null;
  recordedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
}

interface PaymentForm {
  amount: string;
  method: PaymentMethod;
  transactionRef: string;
  paidAt: string;
}

const emptyPaymentForm: PaymentForm = {
  amount: "",
  method: "CASH",
  transactionRef: "",
  paidAt: "",
};

/* ============================================================
   COMPONENT
============================================================ */

const PartnerPaymentsPage = () => {
  const router = useRouter();

  /* ==========================================================
     AUTH
  ========================================================== */

  const user = useSelector(
    (state: RootState) => state.auth.user as IAuthUser | null,
  );

  const isGilbriceStaff = user?.userType === "GILBRICE_STAFF";
  const isPartnerEmployee = user?.userType === "PARTNER_EMPLOYEE";

  // Staff cash/void korte pare, partner employee shudhu payment record korte pare
  const canVoid = isGilbriceStaff;
  const canRecordPayment = isGilbriceStaff || isPartnerEmployee;

  /* ==========================================================
     STATE
  ========================================================== */

  const [shipmentIdInput, setShipmentIdInput] = useState("");
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);

  const [shipment, setShipment] = useState<IShipmentSummary | null>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);

  const [loadingShipment, setLoadingShipment] = useState(false);
  const [adding, setAdding] = useState(false);
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const [form, setForm] = useState<PaymentForm>(emptyPaymentForm);
  const [error, setError] = useState<string | null>(null);

  const [voidReasonMap, setVoidReasonMap] = useState<Record<string, string>>(
    {},
  );

  /* ==========================================================
     PARTNER ID (staff manually kono partner-er hoye search korle
     eta pathano jete pare; partner employee nijer id use korbe)
  ========================================================== */

  const partnerId = useMemo(() => {
    if (isPartnerEmployee) return user?.partnerId ?? undefined;
    return undefined; // staff shipmentId diye search kore, partnerId lagbe na
  }, [isPartnerEmployee, user?.partnerId]);

  /* ==========================================================
     LOAD SHIPMENT SUMMARY + PAYMENTS
  ========================================================== */

  const loadShipmentData = async (shipmentId: string) => {
    if (!shipmentId.trim()) {
      setError("Shipment ID / tracking number is required");
      return;
    }

    setError(null);
    setLoadingShipment(true);

    try {
      const query = partnerId ? `?partnerId=${partnerId}` : "";

      const [summaryRes, paymentsRes] = await Promise.all([
        api.get(`/api/v1/payments/summary/${shipmentId}${query}`),
        api.get(`/api/v1/payments/shipment/${shipmentId}${query}`),
      ]);

      setShipment(summaryRes.data?.data?.shipment ?? null);

      // Summary theke totalAmount/paid/balance shipment object e merge kore nicchi
      const summaryData = summaryRes.data?.data;

      setShipment((prev) => ({
        id: prev?.id ?? shipmentId,
        trackingNumber:
          summaryData?.shipment?.trackingNumber ?? prev?.trackingNumber ?? "",
        finalCustomerAmount: summaryData?.totalAmount ?? 0,
        amountPaidByCustomer: summaryData?.totalPaid ?? 0,
        customerBalance: summaryData?.balance ?? 0,
      }));

      setPayments(paymentsRes.data?.data?.payments ?? []);

      setActiveShipmentId(shipmentId);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load shipment payment info";

      setError(message);
      toast.error(message);

      setShipment(null);
      setPayments([]);
      setActiveShipmentId(null);
    } finally {
      setLoadingShipment(false);
    }
  };

  /* ==========================================================
     ADD PAYMENT
  ========================================================== */

  const handleAddPayment = async () => {
    setError(null);

    if (!activeShipmentId) {
      setError("Search a shipment first");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Payment amount must be greater than zero");
      return;
    }

    const currentBalance = shipment
      ? Number(shipment.customerBalance)
      : undefined;

    if (currentBalance !== undefined && Number(form.amount) > currentBalance) {
      setError(`Amount cannot exceed outstanding balance of ${currentBalance}`);
      return;
    }

    const payload: Record<string, any> = {
      shipmentId: activeShipmentId,
      amount: Number(form.amount),
      method: form.method,
      transactionRef: form.transactionRef.trim() || undefined,
      paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
    };

    // Staff hole partnerId pathate hobe (shipment-er actual owner partner)
    if (isGilbriceStaff) {
      payload.partnerId = shipment ? undefined : undefined; // staff UI-te partner select add korte hobe if needed
    }

    setAdding(true);

    try {
      const res = await api.post(`/api/v1/payments`, payload);

      const result = res.data?.data;

      if (result?.payment) {
        setPayments((prev) => [result.payment, ...prev]);
      }

      if (result?.shipment) {
        setShipment((prev) => ({
          ...(prev as IShipmentSummary),
          amountPaidByCustomer: result.shipment.amountPaidByCustomer,
          customerBalance: result.shipment.customerBalance,
        }));
      }

      setForm(emptyPaymentForm);
      toast.success("Payment recorded successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to record payment";

      setError(message);
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  /* ==========================================================
     VOID PAYMENT
  ========================================================== */

  const handleVoidPayment = async (paymentId: string) => {
    const reason = voidReasonMap[paymentId]?.trim();

    if (!reason) {
      toast.error("Void reason is required");
      return;
    }

    setVoidingId(paymentId);

    try {
      const query = partnerId ? `?partnerId=${partnerId}` : "";

      const res = await api.patch(
        `/api/v1/payments/${paymentId}/void${query}`,
        { reason },
      );

      const result = res.data?.data;

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, isVoided: true, status: "VOIDED", voidReason: reason }
            : p,
        ),
      );

      if (result?.shipment) {
        setShipment((prev) => ({
          ...(prev as IShipmentSummary),
          amountPaidByCustomer: result.shipment.amountPaidByCustomer,
          customerBalance: result.shipment.customerBalance,
        }));
      }

      toast.success("Payment voided");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to void payment";

      toast.error(message);
    } finally {
      setVoidingId(null);
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
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Customer Payments
      </h2>

      {/* SHIPMENT SEARCH */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Find Shipment</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Input
            value={shipmentIdInput}
            onChange={(e) => setShipmentIdInput(e.target.value)}
            placeholder="Shipment ID / Tracking Number"
          />

          <Button
            onClick={() => loadShipmentData(shipmentIdInput.trim())}
            disabled={loadingShipment}
          >
            <Search size={16} className="mr-1" />
            {loadingShipment ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {shipment && (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-gray-800">
                {formatMoney(shipment.finalCustomerAmount)}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-xs text-gray-500 mb-1">Paid</p>
              <p className="text-xl font-bold text-green-600">
                {formatMoney(shipment.amountPaidByCustomer)}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
              <p
                className={`text-xl font-bold ${
                  Number(shipment.customerBalance) > 0
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              >
                {formatMoney(shipment.customerBalance)}
              </p>
            </div>
          </div>

          {/* ADD PAYMENT FORM */}
          {canRecordPayment && Number(shipment.customerBalance) > 0 && (
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h3 className="text-lg font-semibold mb-5">Record a Payment</h3>

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
                    placeholder="6700"
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
                    placeholder="PAY-20260813-002"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Paid At (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.paidAt}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, paidAt: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <Button onClick={handleAddPayment} disabled={adding}>
                  {adding ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </div>
          )}

          {/* PAYMENTS LIST */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment History</h3>
              <span className="text-sm text-gray-500">
                {payments.length} payment{payments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">
                  No payments recorded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="border p-3 text-right">Amount</th>
                      <th className="border p-3 text-left">Method</th>
                      <th className="border p-3 text-left">Ref</th>
                      <th className="border p-3 text-left">Paid At</th>
                      <th className="border p-3 text-left">Recorded By</th>
                      <th className="border p-3 text-center">Status</th>
                      {canVoid && (
                        <th className="border p-3 text-center">Action</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="odd:bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="border p-3 text-right font-medium">
                          {formatMoney(p.amount)}
                        </td>
                        <td className="border p-3">{p.method}</td>
                        <td className="border p-3">
                          {p.transactionRef ?? "-"}
                        </td>
                        <td className="border p-3">{formatDate(p.paidAt)}</td>
                        <td className="border p-3">
                          {p.recordedBy?.fullName ?? "-"}
                        </td>
                        <td className="border p-3 text-center">
                          <span
                            className={
                              p.isVoided
                                ? "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                                : "inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            }
                          >
                            {p.isVoided ? "Voided" : p.status}
                          </span>
                          {p.isVoided && p.voidReason && (
                            <p className="text-xs text-gray-400 mt-1">
                              {p.voidReason}
                            </p>
                          )}
                        </td>

                        {canVoid && (
                          <td className="border p-3 text-center">
                            {!p.isVoided && (
                              <div className="flex flex-col items-center gap-1">
                                <Input
                                  className="text-xs h-7"
                                  placeholder="Reason"
                                  value={voidReasonMap[p.id] ?? ""}
                                  onChange={(e) =>
                                    setVoidReasonMap((prev) => ({
                                      ...prev,
                                      [p.id]: e.target.value,
                                    }))
                                  }
                                />
                                <Button
                                  variant="destructive"
                                  className="h-7 px-2 text-xs"
                                  disabled={voidingId === p.id}
                                  onClick={() => handleVoidPayment(p.id)}
                                >
                                  <Ban size={12} className="mr-1" />
                                  {voidingId === p.id ? "Voiding..." : "Void"}
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
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

export default PartnerPaymentsPage;
