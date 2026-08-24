"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { RootState } from "@/Redux/store";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* ============================================================
   TYPES
============================================================ */

type ShipmentMode = "AIR" | "SEA";

interface IPartner {
  id: string;
  companyName: string;
  slug: string;
}
type UserType = "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";

interface IAuthUser {
  id: string;
  role?: string;
  userType?: UserType;
  partnerId?: string | null;
}
interface IPartnerRate {
  id: string;
  partnerId: string;
  mode: ShipmentMode;
  destination: string;
  ratePerKg: number | string;
  minChargeableKg?: number | string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
}

interface RateForm {
  mode: ShipmentMode;
  destination: string;
  ratePerKg: string;
  minChargeableKg: string;
  effectiveFrom: string;
  effectiveTo: string;
}

/* ============================================================
   EMPTY FORM
============================================================ */

const emptyRateForm: RateForm = {
  mode: "AIR",
  destination: "",
  ratePerKg: "",
  minChargeableKg: "",
  effectiveFrom: "",
  effectiveTo: "",
};

/* ============================================================
   COMPONENT
============================================================ */

const PartnerRatesPage = () => {
  const router = useRouter();
  const params = useParams();

  /* ==========================================================
     AUTH
  ========================================================== */

  const user = useSelector(
    (state: RootState) => state.auth.user as IAuthUser | null,
  );

  const userType = user?.userType;

  const isGilbriceStaff = userType === "GILBRICE_STAFF";
  const isPartnerEmployee = userType === "PARTNER_EMPLOYEE";

  /* ==========================================================
     PARTNER ID
  ========================================================== */

  const routePartnerId =
    typeof params.partnerId === "string" ? params.partnerId : undefined;

  /*
   * Staff:
   * URL থেকে partnerId নেবে
   *
   * Partner Employee:
   * নিজের logged-in partnerId নেবে
   */
  const partnerId = useMemo(() => {
    if (isGilbriceStaff) {
      return routePartnerId;
    }

    if (isPartnerEmployee) {
      return user?.partnerId ?? undefined;
    }

    return undefined;
  }, [isGilbriceStaff, isPartnerEmployee, routePartnerId, user?.partnerId]);

  /* ==========================================================
     STATES
  ========================================================== */

  const [partner, setPartner] = useState<IPartner | null>(null);

  const [rates, setRates] = useState<IPartnerRate[]>([]);

  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState<RateForm>(emptyRateForm);

  const [error, setError] = useState<string | null>(null);

  /* ==========================================================
     LOAD PARTNER + RATES
  ========================================================== */

  const loadData = async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Staff: partner info + rates দুটোই লাগবে
      // Employee: partner info লাগবে না (শুধু rates দেখবে), কিন্তু
      // চাইলে company name দেখানোর জন্য এখানে রাখা হলো — না চাইলে বাদ দিতে পারেন
      const requests = [api.get(`/api/v1/partner/${partnerId}/rates`)];

      if (isGilbriceStaff) {
        requests.unshift(api.get(`/api/v1/partner/${partnerId}`));
      }

      const results = await Promise.all(requests);

      if (isGilbriceStaff) {
        const [partnerRes, ratesRes] = results;
        setPartner(partnerRes.data?.data ?? null);
        setRates(ratesRes.data?.data ?? []);
      } else {
        const [ratesRes] = results;
        setRates(ratesRes.data?.data ?? []);
      }
    } catch (err: any) {
      console.error("Failed to load partner/rates:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load partner rates";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     EFFECT
  ========================================================== */

  useEffect(() => {
    if (partnerId) {
      loadData();
    } else if (user) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, user]);

  /* ==========================================================
     ADD RATE (STAFF ONLY)
  ========================================================== */

  const handleAddRate = async () => {
    if (!isGilbriceStaff) return; // extra guard

    setError(null);

    if (!partnerId) {
      setError("Partner information not found");
      return;
    }

    if (!form.destination.trim()) {
      setError("Destination is required");
      return;
    }

    if (!form.ratePerKg) {
      setError("Rate per kg is required");
      return;
    }

    if (Number(form.ratePerKg) <= 0) {
      setError("Rate per kg must be greater than zero");
      return;
    }

    if (form.minChargeableKg && Number(form.minChargeableKg) <= 0) {
      setError("Minimum chargeable kg must be greater than zero");
      return;
    }

    if (
      form.effectiveFrom &&
      form.effectiveTo &&
      new Date(form.effectiveTo) < new Date(form.effectiveFrom)
    ) {
      setError("Effective To cannot be before Effective From");
      return;
    }

    const payload = {
      mode: form.mode,

      destination: form.destination.trim(),

      ratePerKg: Number(form.ratePerKg),

      minChargeableKg: form.minChargeableKg
        ? Number(form.minChargeableKg)
        : undefined,

      effectiveFrom: form.effectiveFrom ? form.effectiveFrom : undefined,

      effectiveTo: form.effectiveTo ? form.effectiveTo : null,
    };

    try {
      setAdding(true);

      const res = await api.post(`/api/v1/partner/${partnerId}/rates`, payload);

      const newRate = res.data?.data;

      if (newRate) {
        setRates((prev) => [newRate, ...prev]);
      }

      setForm(emptyRateForm);

      toast.success("Wholesale rate added successfully");
    } catch (err: any) {
      console.error("Failed to add rate:", err);

      const message =
        err?.response?.data?.message || "Failed to add wholesale rate";

      setError(message);

      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* ======================================================
          BACK BUTTON — শুধু staff এর জন্য (তারা partners list থেকে আসে)
      ====================================================== */}

      {isGilbriceStaff && (
        <button
          onClick={() => router.push("/superadmin/partners")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to partners
        </button>
      )}

      {/* ======================================================
          PAGE TITLE
      ====================================================== */}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {loading
          ? "Loading..."
          : isGilbriceStaff
            ? `${partner?.companyName ?? "Partner"} — Wholesale Rates`
            : "My Wholesale Rates"}
      </h2>

      {/* ======================================================
          PARTNER INFO — শুধু staff দেখবে
      ====================================================== */}

      {isGilbriceStaff && !loading && partner && (
        <div className="bg-white p-5 rounded-xl shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {partner.companyName}
              </p>

              <p className="text-sm text-gray-500">Slug: {partner.slug}</p>
            </div>

            <div className="text-sm text-gray-500">
              Partner ID:
              <span className="ml-1 font-mono text-xs">{partner.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD RATE FORM — শুধু GILBRICE_STAFF এর জন্য
          (PARTNER_EMPLOYEE এই সেকশনই দেখবে না)
      ====================================================== */}

      {isGilbriceStaff && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="text-lg font-semibold mb-5">Add a Rate</h3>

          {/* Error */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ==================================================
                MODE
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Mode</label>

              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.mode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mode: e.target.value as ShipmentMode,
                  }))
                }
              >
                <option value="AIR">Air</option>

                <option value="SEA">Sea</option>
              </select>
            </div>

            {/* ==================================================
                DESTINATION
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Destination
              </label>

              <Input
                value={form.destination}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
                placeholder="Australia"
              />
            </div>

            {/* ==================================================
                RATE PER KG
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Rate per Kg
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.ratePerKg}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ratePerKg: e.target.value,
                  }))
                }
                placeholder="950"
              />
            </div>

            {/* ==================================================
                MIN CHARGEABLE KG
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Min Chargeable Kg
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.minChargeableKg}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minChargeableKg: e.target.value,
                  }))
                }
                placeholder="1"
              />
            </div>

            {/* ==================================================
                EFFECTIVE FROM
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Effective From
              </label>

              <Input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    effectiveFrom: e.target.value,
                  }))
                }
              />
            </div>

            {/* ==================================================
                EFFECTIVE TO
            ================================================== */}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Effective To
              </label>

              <Input
                type="date"
                value={form.effectiveTo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    effectiveTo: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* ====================================================
              SUBMIT
          ==================================================== */}

          <div className="flex justify-end mt-5">
            <Button onClick={handleAddRate} disabled={adding}>
              {adding ? "Adding..." : "Add Rate"}
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================
          RATES LIST — staff ও employee দুজনেই দেখবে (GET only)
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Wholesale Rates</h3>

          <span className="text-sm text-gray-500">
            {rates.length} rate{rates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Loading rates...
          </div>
        ) : rates.length === 0 ? (
          /* Empty */

          <div className="text-center py-10">
            <p className="text-sm text-gray-400">No rates set yet.</p>
          </div>
        ) : (
          /* Table */

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-secondary text-white">
                <tr>
                  <th className="border p-3 text-left">Mode</th>

                  <th className="border p-3 text-left">Destination</th>

                  <th className="border p-3 text-right">Rate / Kg</th>

                  <th className="border p-3 text-right">Min Kg</th>

                  <th className="border p-3 text-left">Effective From</th>

                  <th className="border p-3 text-left">Effective To</th>

                  <th className="border p-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {rates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="odd:bg-gray-50 hover:bg-gray-100"
                  >
                    {/* Mode */}

                    <td className="border p-3">
                      <span className="font-medium">{rate.mode}</span>
                    </td>

                    {/* Destination */}

                    <td className="border p-3">{rate.destination}</td>

                    {/* Rate */}

                    <td className="border p-3 text-right font-medium">
                      {rate.ratePerKg}
                    </td>

                    {/* Minimum Kg */}

                    <td className="border p-3 text-right">
                      {rate.minChargeableKg ?? "-"}
                    </td>

                    {/* Effective From */}

                    <td className="border p-3">
                      {formatDate(rate.effectiveFrom)}
                    </td>

                    {/* Effective To */}

                    <td className="border p-3">
                      {formatDate(rate.effectiveTo)}
                    </td>

                    {/* Status */}

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
      </div>
    </div>
  );
};

export default PartnerRatesPage;
