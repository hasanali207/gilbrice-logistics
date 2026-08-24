"use client";

import api from "@/lib/axios";
import { getDashboardPath } from "@/lib/route";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  Loader2,
  Package,
  Printer,
  Ruler,
  Scale,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface LabelPackage {
  id: string;
  packageCode: string;
  packageNumber?: number | null;
  description?: string | null;
  weightKg: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  status: string;
}

interface LabelShipment {
  id: string;
  trackingNumber: string;
  mode?: string | null;
  origin: string;
  destination: string;
  totalPackages: number;
}

interface Customer {
  id: string;
  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
}

interface Partner {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  trackingPrefix?: string | null;
}

interface Codes {
  packageCode: string;
  qrCode: string;
  barcode: string;
}

interface LabelData {
  package: LabelPackage;
  shipment: LabelShipment;
  customer?: Customer | null;
  partner: Partner;
  codes: Codes;
}

const PackageLabelPage = () => {
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

  const [data, setData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // ============================================================
  // FETCH LABEL DATA
  // ============================================================

  const fetchLabel = async () => {
    if (!packageId) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/api/v1/package/${packageId}/label${
          partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : ""
        }`,
      );

      setData(res.data.data);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to load package label",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabel();
  }, [packageId, partnerId]);

  // ============================================================
  // PRINT
  // ============================================================

  const handlePrint = () => {
    setPrinting(true);

    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.push(
      `${basePath}/shipments/${shipmentId}/packages${
        partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : ""
      }`,
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading label...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <Package size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">Label not found</h2>

          <p className="mt-1 text-sm text-gray-500">
            Unable to load package label information.
          </p>

          <button
            onClick={handleBack}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const { package: packageInfo, shipment, customer, partner, codes } = data;

  const dimensions =
    packageInfo.lengthCm && packageInfo.widthCm && packageInfo.heightCm
      ? `${packageInfo.lengthCm} × ${packageInfo.widthCm} × ${packageInfo.heightCm} CM`
      : "N/A";

  return (
    <>
      {/* ======================================================
          SCREEN HEADER
      ====================================================== */}

      <div className="no-print min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={17} />
              Back to Packages
            </button>

            <button
              onClick={handlePrint}
              disabled={printing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {printing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              Print Label
            </button>
          </div>

          {/* ==================================================
              LABEL
          ================================================== */}

          <div className="label-paper bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
            {/* HEADER */}

            <div className="px-7 py-5 border-b-2 border-gray-900">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.companyName}
                      className="h-14 w-auto max-w-[180px] object-contain"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                      <Truck size={26} />
                    </div>
                  )}

                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {partner.companyName}
                    </h1>

                    {partner.trackingPrefix && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {partner.trackingPrefix}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">
                    Package Label
                  </p>

                  <p className="text-lg font-bold text-gray-900 mt-1">
                    #{packageInfo.packageNumber || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* PACKAGE CODE */}

            <div className="px-7 py-5 text-center border-b border-gray-200">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Package Code
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-wider text-gray-900">
                {packageInfo.packageCode}
              </h2>
            </div>

            {/* QR + BARCODE */}

            <div className="px-7 py-6 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-6 items-center">
                {/* QR */}

                <div className="flex flex-col items-center">
                  <img
                    src={codes.qrCode}
                    alt="Package QR Code"
                    className="w-40 h-40 object-contain"
                  />

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2">
                    Scan QR Code
                  </p>
                </div>

                {/* BARCODE */}

                <div className="flex flex-col items-center">
                  <img
                    src={codes.barcode}
                    alt="Package Barcode"
                    className="w-full max-w-[300px] h-auto object-contain"
                  />

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2">
                    Scan Barcode
                  </p>
                </div>
              </div>
            </div>

            {/* ROUTE */}

            <div className="px-7 py-5 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    From
                  </p>

                  <p className="mt-1 text-base font-bold text-gray-900">
                    {shipment.origin}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    To
                  </p>

                  <p className="mt-1 text-base font-bold text-gray-900">
                    {shipment.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* SHIPMENT */}

            <div className="px-7 py-5 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Tracking Number
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900 break-all">
                    {shipment.trackingNumber}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Shipment Mode
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {shipment.mode || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Total Packages
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {shipment.totalPackages}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {packageInfo.status}
                  </p>
                </div>
              </div>
            </div>

            {/* PACKAGE DETAILS */}

            <div className="px-7 py-5 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Package size={17} />

                <h3 className="text-sm font-bold text-gray-900">
                  Package Details
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Scale size={13} />

                    <span className="text-[10px] uppercase">Weight</span>
                  </div>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {Number(packageInfo.weightKg).toFixed(2)} KG
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Ruler size={13} />

                    <span className="text-[10px] uppercase">Dimensions</span>
                  </div>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {dimensions}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[10px] uppercase text-gray-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                    {packageInfo.description || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* CUSTOMER */}

            {customer && (
              <div className="px-7 py-5 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <User size={17} />

                  <h3 className="text-sm font-bold text-gray-900">Customer</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {customer.fullName}
                    </p>
                  </div>

                  {customer.phone && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {customer.phone}
                      </p>
                    </div>
                  )}

                  {customer.address && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {customer.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FOOTER */}

            <div className="px-7 py-4 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] text-gray-400">
                  Please handle this package with care.
                </p>

                <p className="text-[10px] font-semibold text-gray-500">
                  {partner.companyName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          PRINT STYLES
      ====================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .label-paper,
          .label-paper * {
            visibility: visible;
          }

          .label-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .no-print {
            background: white !important;
            padding: 0 !important;
            min-height: 0 !important;
          }

          .no-print > div {
            max-width: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default PackageLabelPage;
