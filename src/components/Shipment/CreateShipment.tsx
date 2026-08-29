"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";

import {
  ArrowLeft,
  Calculator,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Package,
  Save,
  Truck,
  User,
  Weight,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// ============================================================
// TYPES
// ============================================================

interface Partner {
  id: string;
  companyName: string;
  trackingPrefix?: string;
  isActive?: boolean;
}

interface Customer {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  partnerId?: string;
  isActive?: boolean;
}

interface ShipmentResponse {
  id: string;
  trackingNumber: string;
  status: string;
  partner?: Partner;
  customer?: Customer;
  finalCustomerAmount?: number | string;
}

// ============================================================
// OPTIONS
// ============================================================

const MODE_OPTIONS = [
  {
    value: "",
    label: "Select shipping mode",
  },
  {
    value: "AIR",
    label: "Air",
  },
  {
    value: "SEA",
    label: "Sea",
  },
  {
    value: "ROAD",
    label: "Road",
  },
  {
    value: "COURIER",
    label: "Courier",
  },
];

// ============================================================
// HELPERS
// ============================================================

const formatAmount = (value: number | string | null | undefined) => {
  return Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getCustomerName = (customer?: Customer) => {
  return customer?.fullName || customer?.name || "Unnamed Customer";
};

// ============================================================
// PAGE
// ============================================================

const CreateShipment = () => {
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);

  const basePath = getDashboardPath(user?.role);

  // ============================================================
  // ROLE
  // ============================================================

  const isPartnerUser = user?.userType === "PARTNER_EMPLOYEE";

  const ownPartnerId = user?.partnerId || "";

  // ============================================================
  // STATE
  // ============================================================

  const [partners, setPartners] = useState<Partner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [refreshingCustomers, setRefreshingCustomers] = useState(false);
  const VOLUMETRIC_DIVISOR = 5000; // ইন্ডাস্ট্রি স্ট্যান্ডার্ড, cm³ থেকে kg
  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    mode: "",
    origin: "",
    destination: "",
    actualWeightKg: "",
    lengthCm: "", // 👈 নতুন
    widthCm: "", // 👈 নতুন
    heightCm: "", // 👈 নতুন
    retailRatePerKg: "",
    discount: "0",
    additionalFees: "0",
  });

  // ============================================================
  // EFFECTIVE PARTNER
  // ============================================================

  const effectivePartnerId = useMemo(() => {
    if (isPartnerUser) {
      return ownPartnerId;
    }

    return selectedPartnerId;
  }, [isPartnerUser, ownPartnerId, selectedPartnerId]);

  // ============================================================
  // CALCULATION
  // ============================================================

  const calculation = useMemo(() => {
    const actual = Number(form.actualWeightKg || 0);

    const length = Number(form.lengthCm || 0);
    const width = Number(form.widthCm || 0);
    const height = Number(form.heightCm || 0);

    // Volumetric Weight Auto-Calculate
    const volumetric =
      length > 0 && width > 0 && height > 0
        ? (length * width * height) / VOLUMETRIC_DIVISOR
        : 0;

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
  // FETCH PARTNERS
  // ONLY STAFF
  // ============================================================

  const fetchPartners = async () => {
    if (isPartnerUser) return;

    try {
      setLoadingPartners(true);

      const res = await api.get("/api/v1/partner");

      const data = res.data?.data;

      let list: Partner[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      const activePartners = list.filter(
        (partner) => partner.isActive !== false,
      );

      setPartners(activePartners);

      if (activePartners.length === 1) {
        setSelectedPartnerId(activePartners[0].id);
      }
    } catch (error: any) {
      console.error("Failed to load partners:", error);

      toast.error(error?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoadingPartners(false);
    }
  };

  // ============================================================
  // FETCH CUSTOMERS
  // ============================================================

  const fetchCustomers = async (partnerId: string) => {
    if (!partnerId) {
      setCustomers([]);
      setSelectedCustomerId("");
      return;
    }

    try {
      setLoadingCustomers(true);

      const res = await api.get(
        `/api/v1/customer?partnerId=${encodeURIComponent(partnerId)}`,
      );

      const data = res.data?.data;

      let list: Customer[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      }

      const activeCustomers = list.filter(
        (customer) => customer.isActive !== false,
      );

      setCustomers(activeCustomers);
      setSelectedCustomerId("");
    } catch (error: any) {
      console.error("Failed to load customers:", error);

      setCustomers([]);
      setSelectedCustomerId("");

      toast.error(error?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoadingCustomers(false);
      setRefreshingCustomers(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!user) return;

    if (!isPartnerUser) {
      fetchPartners();
    }
  }, [user, isPartnerUser]);

  // ============================================================
  // LOAD CUSTOMERS
  // ============================================================

  useEffect(() => {
    if (!effectivePartnerId) {
      setCustomers([]);
      setSelectedCustomerId("");
      return;
    }

    fetchCustomers(effectivePartnerId);
  }, [effectivePartnerId]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // PARTNER CHANGE
  // ============================================================

  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);

    setSelectedCustomerId("");
    setCustomers([]);
  };

  // ============================================================
  // CUSTOMER CHANGE
  // ============================================================

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  // ============================================================
  // REFRESH CUSTOMERS
  // ============================================================

  const handleRefreshCustomers = async () => {
    if (!effectivePartnerId) {
      toast.error("Partner information is not available");
      return;
    }

    setRefreshingCustomers(true);

    await fetchCustomers(effectivePartnerId);
  };

  // ============================================================
  // VALIDATE
  // ============================================================

  const validateForm = () => {
    if (!effectivePartnerId) {
      toast.error("Partner information is required");
      return false;
    }

    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return false;
    }

    if (!form.mode) {
      toast.error("Please select shipment mode");
      return false;
    }

    if (!form.origin.trim()) {
      toast.error("Origin is required");
      return false;
    }

    if (!form.destination.trim()) {
      toast.error("Destination is required");
      return false;
    }

    if (!form.actualWeightKg || calculation.actual <= 0) {
      toast.error("Actual weight must be greater than 0");
      return false;
    }

    if (form.retailRatePerKg === "" || calculation.retailRate < 0) {
      toast.error("Retail rate cannot be negative");
      return false;
    }

    if (calculation.discount < 0) {
      toast.error("Discount cannot be negative");
      return false;
    }

    if (calculation.additionalFees < 0) {
      toast.error("Additional fees cannot be negative");
      return false;
    }

    if (calculation.finalAmount < 0) {
      toast.error("Final customer amount cannot be negative");
      return false;
    }

    return true;
  };

  // ============================================================
  // CREATE SHIPMENT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        // IMPORTANT:
        // Staff -> selected partner যাবে
        // Partner User -> backend নিজের partnerId নেবে
        ...(isPartnerUser
          ? {}
          : {
              partnerId: selectedPartnerId,
            }),

        customerId: selectedCustomerId,

        mode: form.mode,

        origin: form.origin.trim(),

        destination: form.destination.trim(),

        actualWeightKg: calculation.actual,

        volumetricWeightKg:
          calculation.volumetric > 0 ? calculation.volumetric : undefined,

        retailRatePerKg: calculation.retailRate,

        discount: calculation.discount,

        additionalFees: calculation.additionalFees,
      };

      console.log("CREATE SHIPMENT PAYLOAD:", payload);

      const res = await api.post("/api/v1/shipment", payload);

      const createdShipment: ShipmentResponse | undefined = res.data?.data;

      if (!createdShipment) {
        throw new Error("Shipment was created but response data was not found");
      }

      toast.success(
        `Shipment ${createdShipment.trackingNumber} created successfully`,
      );

      // ========================================================
      // REDIRECT
      // ========================================================

      if (isPartnerUser && ownPartnerId) {
        router.push(
          `${basePath}/partners/${ownPartnerId}/shipments/${createdShipment.id}`,
        );

        return;
      }

      if (selectedPartnerId) {
        router.push(
          `${basePath}/partners/${selectedPartnerId}/shipments/${createdShipment.id}`,
        );

        return;
      }

      router.push(`${basePath}/shipments/${createdShipment.id}`);
    } catch (error: any) {
      console.error("Failed to create shipment:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create shipment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (isPartnerUser && ownPartnerId) {
      router.push(`${basePath}/partners/${ownPartnerId}/shipments`);

      return;
    }

    if (selectedPartnerId) {
      router.push(`${basePath}/partners/${selectedPartnerId}/shipments`);

      return;
    }

    router.push(`${basePath}/shipments`);
  };

  // ============================================================
  // SELECTED CUSTOMER
  // ============================================================

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  // ============================================================
  // SELECTED PARTNER
  // ============================================================

  const selectedPartner = partners.find(
    (partner) => partner.id === selectedPartnerId,
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* =====================================================
            TOP BAR
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-3"
            >
              <ArrowLeft size={16} />
              Back to Shipments
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10">
                <Package size={22} className="text-secondary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Create Shipment
                </h1>

                <p className="text-sm text-gray-500 mt-0.5">
                  Create a new shipment booking and calculate the customer
                  charge.
                </p>
              </div>
            </div>
          </div>

          {/* PARTNER INDICATOR */}

          {isPartnerUser ? (
            <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Truck size={18} className="text-gray-600" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Partner
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  Your Partner Account
                </p>
              </div>
            </div>
          ) : selectedPartner ? (
            <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Truck size={18} className="text-gray-600" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Partner
                </p>

                <p className="text-sm font-semibold text-gray-800">
                  {selectedPartner.companyName}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-6">
              {/* =================================================
                  PARTNER & CUSTOMER
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <User size={18} className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Partner & Customer
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Select who is sending this shipment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={`grid grid-cols-1 ${
                      isPartnerUser ? "md:grid-cols-1" : "md:grid-cols-2"
                    } gap-5`}
                  >
                    {/* =================================================
                        PARTNER — STAFF ONLY
                    ================================================= */}

                    {!isPartnerUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Partner <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <select
                            value={selectedPartnerId}
                            onChange={(e) =>
                              handlePartnerChange(e.target.value)
                            }
                            disabled={loadingPartners}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            <option value="">
                              {loadingPartners
                                ? "Loading partners..."
                                : "Select partner"}
                            </option>

                            {partners.map((partner) => (
                              <option key={partner.id} value={partner.id}>
                                {partner.companyName}

                                {partner.trackingPrefix
                                  ? ` (${partner.trackingPrefix})`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={17}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>

                        {!loadingPartners && partners.length === 0 && (
                          <p className="mt-1.5 text-xs text-red-500">
                            No partners found.
                          </p>
                        )}
                      </div>
                    )}

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Customer <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => handleCustomerChange(e.target.value)}
                          disabled={
                            !effectivePartnerId ||
                            loadingCustomers ||
                            customers.length === 0
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          <option value="">
                            {!effectivePartnerId
                              ? "Select partner first"
                              : loadingCustomers
                                ? "Loading customers..."
                                : customers.length === 0
                                  ? "No customers found"
                                  : "Select customer"}
                          </option>

                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {getCustomerName(customer)}

                              {customer.phone ? ` — ${customer.phone}` : ""}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>

                      {!loadingCustomers &&
                        effectivePartnerId &&
                        customers.length === 0 && (
                          <p className="mt-1.5 text-xs text-red-500">
                            No customers found for this partner.
                          </p>
                        )}

                      {selectedCustomer && (
                        <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-3">
                          <p className="text-xs text-gray-400">
                            Selected Customer
                          </p>

                          <p className="text-sm font-medium text-gray-800 mt-0.5">
                            {getCustomerName(selectedCustomer)}
                          </p>

                          {selectedCustomer.phone && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {selectedCustomer.phone}
                            </p>
                          )}
                        </div>
                      )}

                      {effectivePartnerId && (
                        <button
                          type="button"
                          onClick={handleRefreshCustomers}
                          disabled={loadingCustomers || refreshingCustomers}
                          className="mt-3 text-xs font-medium text-secondary hover:underline disabled:opacity-50"
                        >
                          {refreshingCustomers
                            ? "Refreshing..."
                            : "Refresh customers"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  ROUTE
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                      <MapPin size={18} className="text-purple-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Shipment Route
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Specify the shipment method and route.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* MODE */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Shipping Mode <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          value={form.mode}
                          onChange={(e) => handleChange("mode", e.target.value)}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        >
                          {MODE_OPTIONS.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>

                    {/* ORIGIN */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Origin <span className="text-red-500">*</span>
                      </label>

                      <input
                        value={form.origin}
                        onChange={(e) => handleChange("origin", e.target.value)}
                        placeholder="Houston, US"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                      />
                    </div>

                    {/* DESTINATION */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Destination <span className="text-red-500">*</span>
                      </label>

                      <input
                        value={form.destination}
                        onChange={(e) =>
                          handleChange("destination", e.target.value)
                        }
                        placeholder="Australia"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  WEIGHT & PRICING
              ================================================= */}

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                      <Weight size={18} className="text-orange-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Weight & Pricing
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Enter weight and customer pricing details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* WEIGHT */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* ACTUAL */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                          placeholder="5.00"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-14 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                          KG
                        </span>
                      </div>
                    </div>

                    {/* VOLUMETRIC */}
                    {/* DIMENSIONS (VOLUMETRIC CALCULATION) */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Dimensions (Length × Width × Height in cm)
                      </label>

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.lengthCm}
                          onChange={(e) =>
                            handleChange("lengthCm", e.target.value)
                          }
                          placeholder="L (cm)"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.widthCm}
                          onChange={(e) =>
                            handleChange("widthCm", e.target.value)
                          }
                          placeholder="W (cm)"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.heightCm}
                          onChange={(e) =>
                            handleChange("heightCm", e.target.value)
                          }
                          placeholder="H (cm)"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />
                      </div>

                      {calculation.volumetric > 0 && (
                        <p className="mt-1.5 text-xs text-gray-500">
                          Calculated Volumetric Weight:{" "}
                          <span className="font-semibold text-gray-700">
                            {calculation.volumetric.toFixed(2)} KG
                          </span>
                        </p>
                      )}
                    </div>
                    {/* RATE */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Retail Rate / KG <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
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
                          placeholder="1200"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EXTRA FEES */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    {/* DISCOUNT */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Discount
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
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
                          placeholder="500"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        />
                      </div>
                    </div>

                    {/* ADDITIONAL */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Additional Fees
                      </label>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
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
                          placeholder="200"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
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

            <div>
              <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* SUMMARY HEADER */}

                <div className="bg-gray-900 px-6 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <Calculator size={18} />
                    </div>

                    <div>
                      <h2 className="font-semibold">Shipment Summary</h2>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Live pricing calculation
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUMMARY BODY */}

                <div className="p-6">
                  <div className="space-y-4">
                    {/* WEIGHTS */}

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
                        Weight
                      </p>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Actual Weight</span>

                          <span className="font-medium text-gray-800">
                            {calculation.actual.toFixed(2)} KG
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Volumetric Weight
                          </span>

                          <span className="font-medium text-gray-800">
                            {calculation.volumetric.toFixed(2)} KG
                          </span>
                        </div>

                        <div className="border-t pt-3 flex justify-between">
                          <span className="font-medium text-gray-700">
                            Chargeable Weight
                          </span>

                          <span className="font-bold text-gray-900">
                            {calculation.chargeableWeight.toFixed(2)} KG
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PRICE */}

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rate / KG</span>

                        <span className="font-medium">
                          $ {calculation.retailRate.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer Price</span>

                        <span className="font-medium">
                          $ {calculation.customerPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount</span>

                        <span className="text-red-500">
                          - $ {calculation.discount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Additional Fees</span>

                        <span className="text-green-600">
                          + $ {calculation.additionalFees.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* TOTAL */}

                    <div className="border-t pt-5">
                      <div className="rounded-xl bg-secondary/5 border border-secondary/10 p-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Final Amount
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              Amount payable by customer
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-secondary">
                              $ {calculation.finalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CREATE */}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingPartners ||
                      loadingCustomers ||
                      !effectivePartnerId ||
                      !selectedCustomerId
                    }
                    className="mt-6 w-full rounded-xl bg-secondary px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Creating Shipment...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Save size={18} />
                        Create Shipment
                      </span>
                    )}
                  </button>

                  {/* REQUIRED */}

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                    <Check size={13} />

                    <span>All required fields must be completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
