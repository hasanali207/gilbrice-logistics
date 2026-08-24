"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Hash,
  Loader2,
  MapPin,
  Package,
  Ruler,
  Scale,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface Customer {
  id: string;
  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  customer?: Customer | null;
}

interface ScanEvent {
  id: string;
  status?: string | null;
  location?: string | null;
  notes?: string | null;
  scannedAt: string;
}

interface PackageData {
  id: string;
  packageCode: string;
  description?: string | null;
  weightKg: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  shipment: Shipment;
  scanEvents?: ScanEvent[];
}

const PackageDetails = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);
  const basePath = getDashboardPath(user?.role);

  const packageId =
    typeof params.packageId === "string" ? params.packageId : "";

  const shipmentId =
    typeof params.shipmentId === "string" ? params.shipmentId : "";

  const partnerId = searchParams.get("partnerId") || "";

  const [packageData, setPackageData] = useState<PackageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchPackage = async () => {
    if (!packageId) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/api/v1/package/${packageId}${
          partnerId ? `?partnerId=${partnerId}` : ""
        }`,
      );

      setPackageData(res.data.data);
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to load package");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId, partnerId]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!packageId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this package?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await api.delete(
        `/api/v1/package/${packageId}${
          partnerId ? `?partnerId=${partnerId}` : ""
        }`,
      );

      toast.success("Package deleted successfully");

      router.push(
        `${basePath}/shipments/${shipmentId}/packages${
          partnerId ? `?partnerId=${partnerId}` : ""
        }`,
      );
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = () => {
    router.push(
      `${basePath}/shipments/${shipmentId}/packages/${packageId}/edit${
        partnerId ? `?partnerId=${partnerId}` : ""
      }`,
    );
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.push(
      `${basePath}/shipments/${shipmentId}/packages${
        partnerId ? `?partnerId=${partnerId}` : ""
      }`,
    );
  };

  // ============================================================
  // DIMENSIONS
  // ============================================================

  const dimensions = useMemo(() => {
    if (
      !packageData?.lengthCm ||
      !packageData?.widthCm ||
      !packageData?.heightCm
    ) {
      return null;
    }

    return `${packageData.lengthCm} × ${packageData.widthCm} × ${packageData.heightCm}`;
  }, [packageData]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading package...
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-2xl p-10 text-center">
          <Package size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            Package not found
          </h2>

          <button
            onClick={handleBack}
            className="mt-5 text-sm font-medium text-secondary"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* BACK */}

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft size={17} />
          Back to Packages
        </button>

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Box size={27} className="text-secondary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {packageData.packageCode}
                </h1>

                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  {packageData.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Package details and shipment information
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Edit3 size={16} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">
            {/* PACKAGE OVERVIEW */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Package size={18} className="text-purple-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Package Overview
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Basic package information
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CODE */}

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <Hash size={14} />
                      Package Code
                    </div>

                    <p className="font-semibold text-gray-900">
                      {packageData.packageCode}
                    </p>
                  </div>

                  {/* WEIGHT */}

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <Scale size={14} />
                      Weight
                    </div>

                    <p className="font-semibold text-gray-900">
                      {Number(packageData.weightKg).toFixed(2)} KG
                    </p>
                  </div>

                  {/* DIMENSIONS */}

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <Ruler size={14} />
                      Dimensions
                    </div>

                    <p className="font-semibold text-gray-900">
                      {dimensions ? `${dimensions} CM` : "Not specified"}
                    </p>
                  </div>

                  {/* CREATED */}

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <CalendarDays size={14} />
                      Created
                    </div>

                    <p className="font-semibold text-gray-900">
                      {new Date(packageData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="mt-5">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Description
                  </p>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-6">
                    {packageData.description || "No description provided."}
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPMENT */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Truck size={18} className="text-blue-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Shipment Information
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Parent shipment details
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Tracking Number
                    </p>

                    <p className="text-sm font-semibold text-secondary">
                      {packageData.shipment.trackingNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Shipment Status
                    </p>

                    <p className="text-sm font-semibold text-gray-900">
                      {packageData.shipment.status}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MapPin size={14} />
                      Origin
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                      {packageData.shipment.origin}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MapPin size={14} />
                      Destination
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                      {packageData.shipment.destination}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SCAN EVENTS */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Clock3 size={18} className="text-orange-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Scan History
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Package scan events
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!packageData.scanEvents?.length ? (
                  <div className="py-8 text-center">
                    <Clock3 size={28} className="mx-auto text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No scan events yet
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Scan activity will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {packageData.scanEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center">
                            <CheckCircle2
                              size={17}
                              className="text-secondary"
                            />
                          </div>

                          {index !== packageData.scanEvents!.length - 1 && (
                            <div className="w-px flex-1 bg-gray-200 mt-2" />
                          )}
                        </div>

                        <div className="pb-5">
                          <p className="text-sm font-semibold text-gray-900">
                            {event.status || "Package scanned"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.scannedAt).toLocaleString()}
                          </p>

                          {event.location && (
                            <p className="text-sm text-gray-600 mt-2">
                              {event.location}
                            </p>
                          )}

                          {event.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* CUSTOMER */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                    <User size={18} className="text-green-600" />
                  </div>

                  <h2 className="font-semibold text-gray-900">Customer</h2>
                </div>
              </div>

              <div className="p-6">
                {packageData.shipment.customer ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {packageData.shipment.customer.fullName}
                    </p>

                    {packageData.shipment.customer.phone && (
                      <p className="text-sm text-gray-500 mt-2">
                        {packageData.shipment.customer.phone}
                      </p>
                    )}

                    {packageData.shipment.customer.whatsapp && (
                      <p className="text-sm text-gray-500 mt-1">
                        WhatsApp: {packageData.shipment.customer.whatsapp}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    Customer information unavailable.
                  </p>
                )}
              </div>
            </div>

            {/* STATUS */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <p className="text-xs text-gray-500 mb-2">
                Current Package Status
              </p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {packageData.status}
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Package is linked to shipment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
