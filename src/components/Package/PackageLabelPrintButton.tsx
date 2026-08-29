"use client";

import api from "@/lib/axios";
import { Loader2, Printer, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { LabelData } from "./packageLabelPdf";

interface Props {
  packageId: string;
  partnerId?: string;
  label?: string;
  className?: string;
}

export default function PackageLabelPrintButton({
  packageId,
  partnerId,
  label = "Print Label",
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LabelData | null>(null);

  const handlePreview = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/v1/package/${packageId}/label${
          partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : ""
        }`,
      );

      const labelData: LabelData = res.data.data;

      if (!labelData) {
        toast.error("Label data not found");
        return;
      }

      setData(labelData);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to load package label",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const pkg = data?.package;
  const shipment = data?.shipment;
  const customer = data?.customer;
  const partner = data?.partner;
  const codes = data?.codes;

  const dimensions =
    pkg?.lengthCm && pkg?.widthCm && pkg?.heightCm
      ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} CM`
      : "N/A";

  return (
    <>
      {/* =====================================================
          BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={handlePreview}
        disabled={loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg px-3 py-2
          text-sm font-medium text-white
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Printer size={15} />
            {label}
          </>
        )}
      </button>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {data && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 print:hidden">
          <div className="flex h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Package Label Preview
                </h2>

                <p className="text-xs text-gray-500">100mm × 150mm</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <Printer size={15} />
                  Print Label
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PREVIEW AREA */}

            <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-8">
              <div className="label-preview">
                <LabelContent data={data} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRINT VERSION
      ===================================================== */}

      {data && (
        <div className="print-label">
          <LabelContent data={data} />
        </div>
      )}

      {/* =====================================================
          PRINT CSS
      ===================================================== */}

      <style jsx global>{`
        .print-label {
          display: none;
        }

        .label-preview {
          width: 100mm;
          min-height: 150mm;
          background: white;
          padding: 4mm;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0;
          }

          html,
          body {
            width: 100mm !important;
            height: 150mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-label,
          .print-label * {
            visibility: visible !important;
          }

          .print-label {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            min-height: 150mm !important;
            background: white !important;
          }

          .label-preview {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* ============================================================
   LABEL CONTENT
============================================================ */

function LabelContent({ data }: { data: LabelData }) {
  const { package: pkg, shipment, customer, partner, codes } = data;

  const dimensions =
    pkg.lengthCm && pkg.widthCm && pkg.heightCm
      ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} CM`
      : "N/A";

  return (
    <div
      className="w-full bg-white text-black"
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}

      <div className="flex items-start justify-between border-b border-black pb-2">
        <div>
          <div className="text-[13px] font-bold">{partner.companyName}</div>

          {partner.trackingPrefix && (
            <div className="mt-0.5 text-[7px] text-gray-500">
              {partner.trackingPrefix}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[7px] font-bold text-gray-500">PACKAGE</div>

          <div className="mt-0.5 text-[11px] font-bold">
            #{pkg.packageNumber ?? "—"}
          </div>
        </div>
      </div>

      {/* PACKAGE CODE */}

      <div className="py-2 text-center">
        <div className="text-[18px] font-bold tracking-wider">
          {pkg.packageCode}
        </div>
      </div>

      {/* BARCODE */}

      <div className="flex justify-center">
        {codes.barcode && (
          <img
            src={codes.barcode}
            alt="Barcode"
            className="h-[18mm] w-[70mm] object-contain"
          />
        )}
      </div>

      <div className="mb-2 text-center text-[8px] tracking-wider">
        {codes.packageCode}
      </div>

      {/* QR + ROUTE */}

      <div className="flex gap-3 border-b border-gray-300 pb-2">
        <div className="w-[32mm] shrink-0 text-center">
          {codes.qrCode && (
            <img
              src={codes.qrCode}
              alt="QR Code"
              className="mx-auto h-[28mm] w-[28mm] object-contain"
            />
          )}

          <div className="mt-1 text-[6px] text-gray-500">SCAN QR</div>
        </div>

        <div className="flex-1 pt-1">
          <div className="text-[6px] font-bold text-gray-500">FROM</div>

          <div className="mb-2 text-[10px] font-bold">
            {shipment.origin || "N/A"}
          </div>

          <div className="text-[6px] font-bold text-gray-500">TO</div>

          <div className="mb-2 text-[10px] font-bold">
            {shipment.destination || "N/A"}
          </div>

          <div className="text-[8px] font-bold">{shipment.trackingNumber}</div>
        </div>
      </div>

      {/* SHIPMENT */}

      <InfoTable
        rows={[
          ["SHIPMENT MODE", shipment.mode || "N/A"],
          ["TOTAL PACKAGES", String(shipment.totalPackages)],
          ["STATUS", pkg.status],
        ]}
      />

      {/* PACKAGE */}

      <InfoTable
        rows={[
          ["WEIGHT", `${Number(pkg.weightKg).toFixed(2)} KG`],
          ["DIMENSIONS", dimensions],
          ["DESCRIPTION", pkg.description || "N/A"],
        ]}
      />

      {/* CUSTOMER */}

      {customer && (
        <InfoTable
          rows={[
            ["CUSTOMER", customer.fullName],
            ...(customer.phone ? [["PHONE", customer.phone]] : []),
            ...(customer.address ? [["ADDRESS", customer.address]] : []),
          ]}
        />
      )}

      {/* FOOTER */}

      <div className="mt-2 border-t border-black pt-2 text-center">
        <div className="text-[7px] font-bold">{partner.companyName}</div>

        <div className="mt-1 text-[6px] text-gray-500">Handle with care</div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO TABLE
============================================================ */

function InfoTable({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-2 border border-gray-300">
      {rows.map(([label, value], index) => (
        <div
          key={index}
          className="flex border-b border-gray-300 last:border-b-0"
        >
          <div className="w-[25mm] shrink-0 border-r border-gray-300 px-1.5 py-1 text-[6px] font-bold text-gray-500">
            {label}
          </div>

          <div className="min-w-0 flex-1 px-1.5 py-1 text-[7px] font-semibold break-words">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
