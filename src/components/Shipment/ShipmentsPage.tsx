"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import { Eye, Loader2, Plus, RefreshCw, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// ============================================================
// TYPES
// ============================================================

interface IShipment {
  id: string;
  trackingNumber: string;
  status: string;
  mode: string;

  origin: string;
  destination: string;

  actualWeightKg: number | string;
  volumetricWeightKg: number | string | null;
  chargeableWeightKg: number | string;

  retailRatePerKg: number | string;
  customerPrice: number | string;
  discount: number | string;
  additionalFees: number | string;
  finalCustomerAmount: number | string;

  customerPaid: number | string;
  customerBalance: number | string;

  createdAt: string;

  partner: {
    id: string;
    companyName: string;
    trackingPrefix: string;
  };

  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    whatsapp?: string | null;
    email?: string | null;
  };
}

interface Props {
  partnerId?: string;
}

// ============================================================
// STATUS
// ============================================================

const STATUS_OPTIONS = [
  "BOOKED",
  "RECEIVED",
  "WEIGHED",
  "MANIFESTED",
  "LOADED",
  "DEPARTED",
  "ARRIVED",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
];

// ============================================================
// PAGE
// ============================================================

const ShipmentsPage = ({ partnerId }: Props) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);
  const query = partnerId ? `?partnerId=${partnerId}` : "";

  // ============================================================
  // STATE
  // ============================================================

  const [shipments, setShipments] = useState<IShipment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ============================================================
  // FETCH SHIPMENTS
  // ============================================================

  const fetchShipments = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/api/v1/shipment", {
        params: partnerId
          ? {
              partnerId,
            }
          : undefined,
      });

      console.log("SHIPMENTS API:", res.data);

      const data = res.data?.data;

      setShipments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load shipments:", error);

      toast.error(error?.response?.data?.message || "Failed to load shipments");

      setShipments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchShipments();
  }, [partnerId]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredShipments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      // --------------------------------------------------------
      // Search
      // --------------------------------------------------------

      const customerName =
        shipment.customer?.fullName || shipment.customer?.fullName || "";

      const matchesSearch =
        !keyword ||
        shipment.trackingNumber?.toLowerCase().includes(keyword) ||
        customerName.toLowerCase().includes(keyword) ||
        shipment.customer?.phone?.toLowerCase().includes(keyword) ||
        shipment.destination?.toLowerCase().includes(keyword) ||
        shipment.origin?.toLowerCase().includes(keyword) ||
        shipment.partner?.companyName?.toLowerCase().includes(keyword);

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      const matchesStatus = !status || shipment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, status]);

  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  const formatAmount = (amount: string | number) => {
    return Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-BD", {
      dateStyle: "medium",
    });
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const statusClass = (value: string) => {
    switch (value) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "ARRIVED":
      case "READY_FOR_PICKUP":
        return "bg-blue-100 text-blue-700";

      case "DEPARTED":
      case "LOADED":
        return "bg-purple-100 text-purple-700";

      case "BOOKED":
      case "RECEIVED":
      case "WEIGHED":
      case "MANIFESTED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalShipments = filteredShipments.length;

  const deliveredShipments = filteredShipments.filter(
    (item) => item.status === "DELIVERED",
  ).length;

  const outstandingAmount = filteredShipments.reduce(
    (sum, item) => sum + Number(item.customerBalance || 0),
    0,
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading shipments...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        {/* TITLE */}

        <div>
          <div className="flex items-center gap-3">
            <Truck size={24} className="text-secondary" />

            <h1 className="text-2xl font-bold text-gray-800">Shipments</h1>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {partnerId
              ? "Manage shipments for this partner"
              : "Manage shipment bookings, tracking and delivery status"}
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex gap-2">
          {/* REFRESH */}

          <button
            onClick={fetchShipments}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {/* CREATE */}

          <Link
            href={
              partnerId
                ? `${basePath}/shipments/create?partnerId=${encodeURIComponent(
                    partnerId,
                  )}`
                : `${basePath}/shipments/create`
            }
            className="inline-flex items-center justify-center gap-2 bg-secondary text-white rounded-lg px-4 py-2 text-sm hover:opacity-90"
          >
            <Plus size={17} />
            Create Shipment
          </Link>
        </div>
      </div>

      {/* ====================================================== */}
      {/* PARTNER INFO */}
      {/* ====================================================== */}

      {partnerId && shipments.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase">
                Partner
              </p>

              <p className="font-semibold text-gray-800">
                {shipments[0]?.partner?.companyName || "Partner"}
              </p>
            </div>

            <div>
              <p className="text-xs text-blue-600 font-medium uppercase">
                Tracking Prefix
              </p>

              <p className="font-mono font-semibold text-gray-800">
                {shipments[0]?.partner?.trackingPrefix || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SEARCH */}

          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking number, customer, phone, partner..."
              className="w-full border rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>

          {/* STATUS */}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30"
          >
            <option value="">All Status</option>

            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* TOTAL */}

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Shipments</p>

          <p className="text-2xl font-bold mt-1">{totalShipments}</p>
        </div>

        {/* DELIVERED */}

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Delivered</p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {deliveredShipments}
          </p>
        </div>

        {/* OUTSTANDING */}

        <div className="bg-white border rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Outstanding</p>

          <p className="text-2xl font-bold text-orange-600 mt-1">
            $ {formatAmount(outstandingAmount)}
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {/* TABLE HEADER */}

        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <Truck size={20} />

            <h2 className="text-lg font-semibold">Shipment List</h2>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {filteredShipments.length} shipment
            {filteredShipments.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-secondary text-white">
              <tr>
                <th className="border p-3 text-left">Tracking</th>

                {/* PARTNER ONLY ON ALL SHIPMENTS */}

                {!partnerId && (
                  <th className="border p-3 text-left">Partner</th>
                )}

                <th className="border p-3 text-left">Customer</th>

                <th className="border p-3 text-left">Route</th>

                <th className="border p-3 text-left">Mode</th>

                <th className="border p-3 text-right">Weight</th>

                <th className="border p-3 text-right">Amount</th>

                <th className="border p-3 text-right">Due</th>

                <th className="border p-3 text-center">Status</th>

                <th className="border p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => {
                const customerName =
                  shipment.customer?.fullName ||
                  shipment.customer?.fullName ||
                  "—";

                return (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    {/* TRACKING */}

                    <td className="border p-3">
                      <Link
                        href={`${basePath}/shipments/${shipment.id}`}
                        className="font-mono font-semibold text-blue-600 hover:underline"
                      >
                        {shipment.trackingNumber}
                      </Link>

                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(shipment.createdAt)}
                      </div>
                    </td>

                    {/* PARTNER */}

                    {!partnerId && (
                      <td className="border p-3">
                        <div className="font-medium">
                          {shipment.partner?.companyName || "—"}
                        </div>

                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {shipment.partner?.trackingPrefix || "—"}
                        </div>
                      </td>
                    )}

                    {/* CUSTOMER */}

                    <td className="border p-3">
                      <div className="font-medium">{customerName}</div>

                      <div className="text-xs text-gray-500 mt-1">
                        {shipment.customer?.phone || "—"}
                      </div>
                    </td>

                    {/* ROUTE */}

                    <td className="border p-3">
                      <div>{shipment.origin}</div>

                      <div className="text-gray-400">↓</div>

                      <div>{shipment.destination}</div>
                    </td>

                    {/* MODE */}

                    <td className="border p-3">
                      <span className="font-medium">{shipment.mode}</span>
                    </td>

                    {/* WEIGHT */}

                    <td className="border p-3 text-right whitespace-nowrap">
                      {Number(shipment.chargeableWeightKg || 0).toFixed(2)} KG
                    </td>

                    {/* AMOUNT */}

                    <td className="border p-3 text-right whitespace-nowrap">
                      $ {formatAmount(shipment.finalCustomerAmount)}
                    </td>

                    {/* DUE */}

                    <td className="border p-3 text-right whitespace-nowrap">
                      <span
                        className={
                          Number(shipment.customerBalance) > 0
                            ? "text-red-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        $ {formatAmount(shipment.customerBalance)}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="border p-3 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusClass(
                          shipment.status,
                        )}`}
                      >
                        {shipment.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="border p-3 text-center">
                      <Link
                        href={
                          partnerId
                            ? `${basePath}/shipments/${shipment.id}?partnerId=${encodeURIComponent(partnerId)}`
                            : `${basePath}/shipments/${shipment.id}?partnerId=${encodeURIComponent(
                                shipment.partner.id,
                              )}`
                        }
                        className="inline-flex items-center gap-1 border rounded-lg px-3 py-1.5 text-xs hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {/* EMPTY */}

              {filteredShipments.length === 0 && (
                <tr>
                  <td
                    colSpan={partnerId ? 9 : 10}
                    className="text-center py-16 text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Truck size={35} className="mb-3 opacity-40" />

                      <p className="font-medium">No shipments found.</p>

                      {(search || status) && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setStatus("");
                          }}
                          className="text-sm text-blue-600 hover:underline mt-2"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
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

export default ShipmentsPage;
