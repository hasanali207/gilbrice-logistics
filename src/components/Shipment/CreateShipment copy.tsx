"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Package,
  Plane,
  Save,
  Ship,
  Truck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const MODE_OPTIONS = [
  {
    value: "AIR",
    label: "Air Freight",
    description: "Fast international delivery",
    icon: Plane,
  },
  {
    value: "SEA",
    label: "Sea Freight",
    description: "Cost-effective shipping",
    icon: Ship,
  },
  {
    value: "ROAD",
    label: "Road Freight",
    description: "Regional transportation",
    icon: Truck,
  },
  {
    value: "COURIER",
    label: "Courier",
    description: "Express parcel delivery",
    icon: Package,
  },
];

interface Customer {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
}

interface Partner {
  id: string;
  companyName: string;
  trackingPrefix?: string;
}

const inputClass =
  "w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10";

const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

const CreateShipment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  // Partner page থেকে এলে:
  // /shipments/create?partnerId=xxxx
  const routePartnerId = searchParams.get("partnerId") || "";

  const [partners, setPartners] = useState<Partner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [partnerId, setPartnerId] = useState(routePartnerId);
  const [partner, setPartner] = useState<Partner | null>(null);

  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    mode: "AIR",
    origin: "",
    destination: "",
    actualWeightKg: "",
    volumetricWeightKg: "",
    retailRatePerKg: "",
    discount: "",
    additionalFees: "",
  });

  // ============================================================
  // FETCH ALL PARTNERS
  // ============================================================

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);

      const res = await api.get("/api/v1/partner");

      const data = res.data?.data;

      if (Array.isArray(data)) {
        setPartners(data);
      } else if (Array.isArray(data?.partners)) {
        setPartners(data.partners);
      } else {
        setPartners([]);
      }
    } catch (error: any) {
      console.error("Failed to load partners:", error);

      toast.error(error?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoadingPartners(false);
    }
  };

  // ============================================================
  // FETCH PARTNER
  // ============================================================

  const fetchPartner = async (id: string) => {
    if (!id) return;

    try {
      const res = await api.get(`/api/v1/partner/${id}`);

      const data = res.data?.data;

      if (data) {
        setPartner(data);

        setPartners((prev) => {
          const exists = prev.some((item) => item.id === data.id);

          if (exists) return prev;

          return [...prev, data];
        });
      }
    } catch (error: any) {
      console.error("Failed to load partner:", error);
    }
  };

  // ============================================================
  // FETCH CUSTOMERS
  // ============================================================

  const fetchCustomers = async (id: string) => {
    if (!id) {
      setCustomers([]);
      return;
    }

    try {
      setLoadingCustomers(true);

      const res = await api.get(`/api/v1/customer?partnerId=${id}`);

      const data = res.data?.data;

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.customers)) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
      }
    } catch (error: any) {
      console.error("Failed to load customers:", error);

      setCustomers([]);

      toast.error(error?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchPartners();

    if (routePartnerId) {
      fetchPartner(routePartnerId);
      fetchCustomers(routePartnerId);
    }
  }, [routePartnerId]);

  // ============================================================
  // PARTNER CHANGE
  // ============================================================

  const handlePartnerChange = (id: string) => {
    setPartnerId(id);

    const selected = partners.find((item) => item.id === id) || null;

    setPartner(selected);

    // Customer reset
    setForm((prev) => ({
      ...prev,
      customerId: "",
    }));

    if (id) {
      fetchCustomers(id);
    } else {
      setCustomers([]);
    }
  };

  // ============================================================
  // CALCULATION
  // ============================================================

  const calculation = useMemo(() => {
    const actual = Number(form.actualWeightKg || 0);

    const volumetric = Number(form.volumetricWeightKg || 0);

    const retailRate = Number(form.retailRatePerKg || 0);

    const discount = Number(form.discount || 0);

    const additionalFees = Number(form.additionalFees || 0);

    const chargeableWeight = Math.max(actual, volumetric);

    const customerPrice = chargeableWeight * retailRate;

    const finalAmount = customerPrice - discount + additionalFees;

    return {
      actual,
      volumetric,
      retailRate,
      discount,
      additionalFees,
      chargeableWeight,
      customerPrice,
      finalAmount,
    };
  }, [form]);

  // ============================================================
  // CHANGE
  // ============================================================

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partnerId) {
      toast.error("Please select a partner");
      return;
    }

    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!form.origin.trim()) {
      toast.error("Origin is required");
      return;
    }

    if (!form.destination.trim()) {
      toast.error("Destination is required");
      return;
    }

    if (!form.actualWeightKg || Number(form.actualWeightKg) <= 0) {
      toast.error("Enter a valid actual weight");
      return;
    }

    if (!form.retailRatePerKg || Number(form.retailRatePerKg) < 0) {
      toast.error("Enter a valid retail rate");
      return;
    }

    if (calculation.finalAmount < 0) {
      toast.error("Final amount cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        partnerId,

        customerId: form.customerId,

        mode: form.mode,

        origin: form.origin.trim(),

        destination: form.destination.trim(),

        actualWeightKg: Number(form.actualWeightKg),

        ...(form.volumetricWeightKg !== "" && {
          volumetricWeightKg: Number(form.volumetricWeightKg),
        }),

        retailRatePerKg: Number(form.retailRatePerKg),

        discount: Number(form.discount || 0),

        additionalFees: Number(form.additionalFees || 0),
      };

      const res = await api.post("/api/v1/shipment", payload);

      toast.success("Shipment created successfully");

      const shipmentId = res.data?.data?.id;

      if (!shipmentId) {
        router.push(
          partnerId
            ? `${basePath}/partners/${partnerId}/shipments`
            : `${basePath}/shipments`,
        );

        return;
      }

      router.push(`${basePath}/shipments/${shipmentId}?partnerId=${partnerId}`);
    } catch (error: any) {
      console.error("Failed to create shipment:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create shipment",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (partnerId) {
      router.push(`${basePath}/partners/${partnerId}/shipments`);
    } else {
      router.push(`${basePath}/shipments`);
    }
  };

  // ============================================================
  // SELECTED CUSTOMER
  // ============================================================

  const selectedCustomer = customers.find(
    (customer) => customer.id === form.customerId,
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="flex items-center justify-between mb-7">
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white group-hover:border-gray-300">
              <ArrowLeft size={16} />
            </span>
            Back to Shipments
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <Package size={15} />
            Shipment Management
          </div>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-sm">
              <Package size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Create Shipment
              </h1>

              <p className="mt-1.5 text-sm text-gray-500">
                Create a new shipment booking and configure its pricing.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-6">
              {/* =================================================
                  PARTNER & CUSTOMER
              ================================================= */}

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Users size={18} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Partner & Customer
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Select the partner and customer for this shipment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* PARTNER */}

                    <div>
                      <label className={labelClass}>Partner *</label>

                      {routePartnerId ? (
                        <div className="h-11 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                              <Package size={14} className="text-secondary" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {partner?.companyName || "Loading partner..."}
                              </p>

                              {partner?.trackingPrefix && (
                                <p className="text-[11px] text-gray-400">
                                  {partner.trackingPrefix}
                                </p>
                              )}
                            </div>
                          </div>

                          <Check
                            size={17}
                            className="text-emerald-500 flex-shrink-0"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={partnerId}
                            onChange={(e) =>
                              handlePartnerChange(e.target.value)
                            }
                            disabled={loadingPartners}
                            className={`${inputClass} appearance-none pr-10`}
                          >
                            <option value="">
                              {loadingPartners
                                ? "Loading partners..."
                                : "Select partner"}
                            </option>

                            {partners.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.companyName}
                                {item.trackingPrefix
                                  ? ` — ${item.trackingPrefix}`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={17}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* CUSTOMER */}

                    <div>
                      <label className={labelClass}>Customer *</label>

                      <div className="relative">
                        <select
                          value={form.customerId}
                          onChange={(e) =>
                            handleChange("customerId", e.target.value)
                          }
                          disabled={
                            !partnerId ||
                            loadingCustomers ||
                            customers.length === 0
                          }
                          className={`${inputClass} appearance-none pr-10 disabled:bg-gray-50 disabled:text-gray-400`}
                        >
                          <option value="">
                            {!partnerId
                              ? "Select partner first"
                              : loadingCustomers
                                ? "Loading customers..."
                                : customers.length === 0
                                  ? "No customers found"
                                  : "Select customer"}
                          </option>

                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.fullName ||
                                customer.name ||
                                "Unnamed Customer"}
                              {customer.phone ? ` — ${customer.phone}` : ""}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>

                      {selectedCustomer && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <User size={13} />

                          {selectedCustomer.phone ||
                            selectedCustomer.email ||
                            "Customer selected"}
                        </div>
                      )}

                      {partnerId &&
                        !loadingCustomers &&
                        customers.length === 0 && (
                          <p className="mt-2 text-xs text-amber-600">
                            No customers are available for this partner.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  SHIPPING METHOD
              ================================================= */}

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Truck size={18} className="text-purple-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipping Method
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose how the shipment will be transported.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {MODE_OPTIONS.map((mode) => {
                      const Icon = mode.icon;

                      const active = form.mode === mode.value;

                      return (
                        <button
                          type="button"
                          key={mode.value}
                          onClick={() => handleChange("mode", mode.value)}
                          className={`relative text-left rounded-xl border p-4 transition-all ${
                            active
                              ? "border-secondary bg-secondary/[0.05] ring-2 ring-secondary/10"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {active && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </span>
                          )}

                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                              active
                                ? "bg-secondary text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Icon size={18} />
                          </div>

                          <p className="text-sm font-semibold text-gray-800">
                            {mode.label}
                          </p>

                          <p className="text-[11px] text-gray-500 mt-1 leading-4">
                            {mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* =================================================
                  ROUTE
              ================================================= */}

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <MapPin size={18} className="text-emerald-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipment Route
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Define the origin and destination of the shipment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_50px_1fr] items-end gap-4">
                    {/* ORIGIN */}

                    <div>
                      <label className={labelClass}>Origin *</label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                        />

                        <input
                          value={form.origin}
                          onChange={(e) =>
                            handleChange("origin", e.target.value)
                          }
                          placeholder="Houston, US"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>

                    {/* ARROW */}

                    <div className="hidden md:flex items-center justify-center pb-1">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <ArrowRight size={17} className="text-gray-500" />
                      </div>
                    </div>

                    {/* DESTINATION */}

                    <div>
                      <label className={labelClass}>Destination *</label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500"
                        />

                        <input
                          value={form.destination}
                          onChange={(e) =>
                            handleChange("destination", e.target.value)
                          }
                          placeholder="Sydney, Australia"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  WEIGHT
              ================================================= */}

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Package size={18} className="text-orange-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipment Weight
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Enter actual and volumetric weight.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        Actual Weight <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.actualWeightKg}
                          onChange={(e) =>
                            handleChange("actualWeightKg", e.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pr-14`}
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                          KG
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Volumetric Weight</label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.volumetricWeightKg}
                          onChange={(e) =>
                            handleChange("volumetricWeightKg", e.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pr-14`}
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                          KG
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Chargeable Weight
                    </span>

                    <span className="font-bold text-gray-900">
                      {calculation.chargeableWeight.toFixed(2)} KG
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PRICING
              ================================================= */}

              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Wallet size={18} className="text-indigo-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Pricing Details
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Configure the customer rate and additional charges.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* RATE */}

                    <div>
                      <label className={labelClass}>
                        Retail Rate / KG <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.retailRatePerKg}
                          onChange={(e) =>
                            handleChange("retailRatePerKg", e.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    {/* DISCOUNT */}

                    <div>
                      <label className={labelClass}>Discount</label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.discount}
                          onChange={(e) =>
                            handleChange("discount", e.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    {/* ADDITIONAL */}

                    <div>
                      <label className={labelClass}>Additional Fees</label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.additionalFees}
                          onChange={(e) =>
                            handleChange("additionalFees", e.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT SUMMARY
            ================================================= */}

            <aside>
              <div className="xl:sticky xl:top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* SUMMARY HEADER */}

                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Calculator size={19} className="text-secondary" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipment Summary
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Review before creating
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUMMARY BODY */}

                <div className="p-6">
                  {/* CUSTOMER */}

                  {selectedCustomer && (
                    <div className="mb-5 rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">Customer</p>

                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {selectedCustomer.fullName ||
                              selectedCustomer.name ||
                              "Unnamed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ROUTE */}

                  {(form.origin || form.destination) && (
                    <div className="mb-5 rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

                          <span className="w-px h-6 bg-gray-200" />

                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        </div>

                        <div className="space-y-4 min-w-0">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                              From
                            </p>

                            <p className="text-sm font-medium text-gray-800 truncate">
                              {form.origin || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                              To
                            </p>

                            <p className="text-sm font-medium text-gray-800 truncate">
                              {form.destination || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE */}

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Shipping Mode</span>

                    <span className="text-sm font-semibold text-gray-800">
                      {
                        MODE_OPTIONS.find((item) => item.value === form.mode)
                          ?.label
                      }
                    </span>
                  </div>

                  {/* ACTUAL */}

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Actual Weight</span>

                    <span className="text-sm font-medium text-gray-800">
                      {calculation.actual.toFixed(2)} KG
                    </span>
                  </div>

                  {/* VOLUMETRIC */}

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">
                      Volumetric Weight
                    </span>

                    <span className="text-sm font-medium text-gray-800">
                      {calculation.volumetric.toFixed(2)} KG
                    </span>
                  </div>

                  {/* CHARGEABLE */}

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      Chargeable Weight
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                      {calculation.chargeableWeight.toFixed(2)} KG
                    </span>
                  </div>

                  {/* PRICE */}

                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping Charge</span>

                      <span className="font-medium">
                        $ {calculation.customerPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>

                      <span className="text-red-500">
                        - $ {calculation.discount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Additional Fees</span>

                      <span className="text-gray-700">
                        + $ {calculation.additionalFees.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="mt-5 rounded-2xl bg-gray-900 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Total Amount</p>

                        <p className="text-2xl font-bold text-white mt-1">
                          $ {calculation.finalAmount.toFixed(2)}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Wallet size={18} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* CREATE */}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 mt-5 rounded-xl bg-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Shipment...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Create Shipment
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center mt-3">
                    Please review all shipment details before creating.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
