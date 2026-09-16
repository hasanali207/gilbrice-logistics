"use client";

import { SolaimanLipiBase64 } from "@/fonts/solaiman";

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

export interface LabelData {
  package: LabelPackage;
  shipment: LabelShipment;
  customer?: Customer | null;
  partner: Partner;
  codes: Codes;
}

// ============================================================
// pdfMake CANNOT be imported on the server, and we only want to
// register the custom font once — so we lazily create + cache it.
// ============================================================

let pdfMakeInstance: any = null;

const getPdfMake = async () => {
  if (pdfMakeInstance) return pdfMakeInstance;

  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default;

  // pdfMake in the BROWSER only works with embedded TTF fonts — the
  // standard 14 PDF fonts (Helvetica/Times/Courier) need .afm metric
  // files that simply aren't shipped in the browser bundle, hence the
  // "File 'data/Helvetica-Bold.afm' not found" error. Instead we use
  // Roboto, the TTF font pdfMake itself bundles for exactly this
  // reason — it's embeddable and renders crisp English/Latin text.
  const pdfFontsModule: any = await import("pdfmake/build/vfs_fonts");

  const robotoVfs =
    pdfFontsModule?.vfs ||
    pdfFontsModule?.default?.vfs ||
    pdfFontsModule?.pdfMake?.vfs ||
    pdfFontsModule?.default?.pdfMake?.vfs ||
    {};

  pdfMake.vfs = {
    ...robotoVfs,
    "SolaimanLipi.ttf": SolaimanLipiBase64,
  };

  pdfMake.fonts = {
    // SolaimanLipi is a Bangla font — only used for fields that
    // actually contain Bangla text (see containsBangla below).
    SolaimanLipi: {
      normal: "SolaimanLipi.ttf",
      bold: "SolaimanLipi.ttf",
      italics: "SolaimanLipi.ttf",
      bolditalics: "SolaimanLipi.ttf",
    },
    // Roboto — crisp, embeddable Latin font bundled by pdfMake itself.
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };

  pdfMakeInstance = pdfMake;

  return pdfMake;
};

// Detects Bangla script (Unicode block U+0980–U+09FF) so we only
// fall back to the SolaimanLipi font for fields that actually need it
// — e.g. a customer name or address typed in Bangla.
const containsBangla = (value: string | null | undefined): boolean =>
  !!value && /[\u0980-\u09FF]/.test(value);

const fontFor = (value: string | null | undefined): string =>
  containsBangla(value) ? "SolaimanLipi" : "Roboto";

// ============================================================
// TEXT SAFETY — keeps the label locked to exactly one page.
// Free-text fields (description, address, names, etc.) can be
// arbitrarily long, and pdfMake will silently start a 2nd page
// if the total content overflows the fixed 100×150mm label. We
// clamp every variable-length field to a safe max length instead.
// ============================================================

const sanitizeSingleLine = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

const truncateText = (
  value: string | null | undefined,
  maxLength: number,
): string => {
  if (!value) return "";

  const clean = sanitizeSingleLine(value);

  if (clean.length <= maxLength) return clean;

  return `${clean.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

// ============================================================
// BUILD DOC DEFINITION
// ============================================================

const buildLabelDocDefinition = (data: LabelData): any => {
  const { package: pkg, shipment, customer, partner, codes } = data;

  const dimensions =
    pkg.lengthCm && pkg.widthCm && pkg.heightCm
      ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} CM`
      : "N/A";

  // Bounded copies of every free-text field so the label content
  // can never grow tall/wide enough to spill onto a second page.
  const companyName = truncateText(partner.companyName, 26);
  const originText = truncateText(shipment.origin, 22) || "N/A";
  const destinationText = truncateText(shipment.destination, 22) || "N/A";
  const descriptionText = pkg.description
    ? truncateText(pkg.description, 70)
    : "N/A";
  const customerName = customer ? truncateText(customer.fullName, 40) : "";
  const customerAddress = customer?.address
    ? truncateText(customer.address, 60)
    : "";

  /*
   * 4in × 6in label (standard shipping label size)
   *
   * pdfMake unit = point (72pt = 1 inch)
   * 4in = 288pt
   * 6in = 432pt
   */
  return {
    pageSize: {
      width: 288,
      height: 432,
    },

    pageMargins: [12, 10, 12, 10],

    content: [
      // =====================================================
      // HEADER
      // =====================================================

      {
        columns: [
          {
            stack: [
              {
                text: companyName,
                fontSize: 13,
                bold: true,
                alignment: "left",
                font: fontFor(companyName),
              },
              partner.trackingPrefix
                ? {
                    text: partner.trackingPrefix,
                    fontSize: 7,
                    color: "#000000", // আগে ছিল #666666
                    margin: [0, 1, 0, 0],
                  }
                : {},
            ],
            margin: [6, 3, 0, 0],
          },

          {
            stack: [
              {
                text: "PACKAGE",
                fontSize: 7,
                bold: true,
                alignment: "right",
                color: "#000000", // আগে ছিল #666666
              },
              {
                text: `#${pkg.packageNumber ?? "—"}`,
                fontSize: 11,
                bold: true,
                alignment: "right",
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 7],
      },

      // =====================================================
      // PACKAGE CODE
      // =====================================================

      {
        text: pkg.packageCode,
        fontSize: 15,
        bold: true,
        alignment: "center",
        characterSpacing: 1,
        margin: [0, 0, 0, 5],
      },

      // =====================================================
      // BARCODE
      // =====================================================

      {
        image: codes.barcode,
        width: 235,
        height: 55,
        fit: [235, 55],
        alignment: "center",
        margin: [0, 0, 0, 3],
      },

      // =====================================================
      // QR + ROUTE
      // =====================================================

      {
        columns: [
          {
            stack: [
              {
                image: codes.qrCode,
                width: 90,
                height: 90,
                fit: [90, 90],
                alignment: "center",
              },
            ],
            width: 100,
          },

          {
            stack: [
              {
                text: "FROM",
                fontSize: 6,
                bold: true,
                color: "#000000", // আগে ছিল #777777
              },
              {
                text: originText,
                fontSize: 10,
                bold: true,
                margin: [0, 1, 0, 6],
                font: fontFor(originText),
              },

              {
                text: "TO",
                fontSize: 6,
                bold: true,
                color: "#000000", // আগে ছিল #777777
              },
              {
                text: destinationText,
                fontSize: 11,
                bold: true,
                margin: [0, 1, 0, 7],
                font: fontFor(destinationText),
              },

              {
                text: shipment.trackingNumber,
                fontSize: 8,
                bold: true,
                characterSpacing: 0.5,
              },
            ],
            width: "*",
            margin: [8, 5, 0, 0],
          },
        ],

        margin: [0, 0, 0, 7],
      },

      // =====================================================
      // SHIPMENT INFO
      // =====================================================

      {
        table: {
          widths: [65, "*"],
          body: [
            [
              {
                text: "SHIPMENT MODE",
                style: "label",
              },
              {
                text: shipment.mode || "N/A",
                style: "value",
              },
            ],
            [
              {
                text: "TOTAL PACKAGES",
                style: "label",
              },
              {
                text: String(shipment.totalPackages),
                style: "value",
              },
            ],
            [
              {
                text: "STATUS",
                style: "label",
              },
              {
                text: pkg.status,
                style: "value",
              },
            ],
          ],
        },

        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#CCCCCC",
          vLineColor: () => "#CCCCCC",
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },

        margin: [0, 0, 0, 6],
      },

      // =====================================================
      // PACKAGE DETAILS
      // =====================================================

      {
        table: {
          widths: [55, "*"],
          body: [
            [
              {
                text: "WEIGHT",
                style: "label",
              },
              {
                text: `${Number(pkg.weightKg).toFixed(2)} KG`,
                style: "value",
              },
            ],
            [
              {
                text: "DIMENSIONS",
                style: "label",
              },
              {
                text: dimensions,
                style: "value",
              },
            ],
            [
              {
                text: "DESCRIPTION",
                style: "label",
              },
              {
                text: descriptionText,
                style: "value",
                font: fontFor(descriptionText),
              },
            ],
          ],
        },

        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#CCCCCC",
          vLineColor: () => "#CCCCCC",
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },

        margin: [0, 0, 0, 6],
      },

      // =====================================================
      // CUSTOMER
      // =====================================================

      ...(customer
        ? [
            {
              table: {
                widths: [45, "*"],
                body: [
                  [
                    {
                      text: "CUSTOMER",
                      style: "label",
                    },
                    {
                      text: customerName,
                      style: "value",
                      font: fontFor(customerName),
                    },
                  ],

                  ...(customer.phone
                    ? [
                        [
                          {
                            text: "PHONE",
                            style: "label",
                          },
                          {
                            text: customer.phone,
                            style: "value",
                          },
                        ],
                      ]
                    : []),

                  ...(customer.address
                    ? [
                        [
                          {
                            text: "ADDRESS",
                            style: "label",
                          },
                          {
                            text: customerAddress,
                            style: "value",
                            font: fontFor(customerAddress),
                          },
                        ],
                      ]
                    : []),
                ],
              },

              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#CCCCCC",
                vLineColor: () => "#CCCCCC",
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 3,
                paddingBottom: () => 3,
              },

              margin: [0, 0, 0, 6],
            },
          ]
        : []),

      // =====================================================
      // FOOTER
      // =====================================================

      {
        columns: [
          {
            text: `Generated on: ${new Date().toLocaleString()}`,
            fontSize: 6,
            bold: true,
            alignment: "left",
          },
          {
            text: `Printed from: https://gilbricelogisticgrp.com`,
            fontSize: 6,
            bold: true,
            alignment: "right",
          },
        ],
        margin: [0, 5, 0, 0],
      },
    ],

    defaultStyle: {
      font: "Roboto",
      fontSize: 8,
    },

    styles: {
      label: {
        fontSize: 6,
        bold: true,
        color: "#000000", // আগে ছিল #666666
      },

      value: {
        fontSize: 7.5,
        bold: true,
      },
    },
  };
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Generates the label PDF and returns the pdfMake document instance.
 * The caller decides what to do with it — print(), download(), or
 * getBlob() for sharing. Nothing is triggered automatically.
 */
export const generatePackageLabelPdf = async (data: LabelData) => {
  const pdfMake = await getPdfMake();

  const docDefinition = buildLabelDocDefinition(data);

  return pdfMake.createPdf(docDefinition);
};

/**
 * Reads the generated pdfMake document as a Blob.
 * Useful for sharing (WhatsApp / Web Share API) or uploading.
 */
export const getPackageLabelPdfBlob = (pdfDoc: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      pdfDoc.getBlob((blob: Blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Prints a PDF Blob using a hidden iframe (does NOT open a new tab).
 * This mirrors the original silent-print behaviour: the PDF loads
 * invisibly, the browser's native print dialog (Ctrl+P) opens, and
 * the iframe is cleaned up afterwards.
 */
/**
 * Detects mobile browsers (iOS / Android) where calling print()
 * inside a hidden iframe is unreliable — especially iOS Safari.
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;

  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Opens a PDF Blob in a new tab. Used as the mobile fallback for
 * printing: the user can then use the browser/PDF viewer's own
 * Share → Print (AirPrint / Android print service) action, which
 * is far more reliable on mobile than iframe.print().
 */
export const openPackageLabelPdfBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);

  const win = window.open(url, "_blank");

  // Give the new tab time to load the resource before revoking it.
  setTimeout(() => URL.revokeObjectURL(url), 60000);

  return win;
};

export const printPackageLabelBlob = (blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");

      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";

      iframe.src = blobUrl;

      document.body.appendChild(iframe);

      let cleaned = false;

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;

        // Small delay so we don't rip the iframe out mid-dialog-close
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }

          URL.revokeObjectURL(blobUrl);
          resolve();
        }, 300);
      };

      iframe.onload = () => {
        setTimeout(() => {
          const printWindow = iframe.contentWindow;

          if (!printWindow) {
            cleanup();
            return;
          }

          // Only clean up once the native print dialog is actually
          // closed (printed OR cancelled) — NOT on a fixed timer.
          // This is what let changing paper size / options in the
          // dialog silently force-close it before.
          printWindow.addEventListener("afterprint", cleanup, {
            once: true,
          });

          printWindow.focus();
          printWindow.print();

          // Safety net: some browsers don't fire `afterprint` reliably
          // (e.g. certain mobile webviews). Don't leave the iframe
          // hanging forever in that case.
          setTimeout(cleanup, 60000);
        }, 300);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Backwards-compatible helper: generates the PDF and immediately
 * opens the native print dialog (equivalent to Ctrl+P), same as
 * the old default behaviour of this module.
 */
export const packageLabelPdf = async (data: LabelData) => {
  const pdfDoc = await generatePackageLabelPdf(data);

  const blob = await getPackageLabelPdfBlob(pdfDoc);

  await printPackageLabelBlob(blob);
};

// ============================================================
// PREVIEW IMAGE (pdf.js) — renders page 1 to a data URL.
//
// Embedding a PDF in an <iframe> only shows a preview on desktop
// browsers that ship a native PDF viewer plugin (Chrome/Edge/
// Firefox desktop). Mobile browsers (iOS Safari, Android Chrome)
// generally render an iframe-embedded PDF blank. Rasterizing the
// page ourselves with pdf.js works identically everywhere.
//
// Requires the `pdfjs-dist` package: npm install pdfjs-dist
// ============================================================

let pdfjsLibInstance: any = null;

const getPdfJs = async () => {
  if (pdfjsLibInstance) return pdfjsLibInstance;

  // Import from the package root — subpaths like "legacy/build/pdf" or
  // "build/pdf" vary (and get renamed) between pdfjs-dist major versions,
  // while the root entry point is stable across versions.
  const mod: any = await import("pdfjs-dist");
  const pdfjsLib = mod?.default ?? mod;

  const majorVersion = parseInt(String(pdfjsLib.version).split(".")[0], 10);
  const workerExt = majorVersion >= 4 ? "mjs" : "js";

  // Served straight from the npm package via jsdelivr, so the file
  // always matches the exact installed version — no path guessing.
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.${workerExt}`;

  pdfjsLibInstance = pdfjsLib;

  return pdfjsLib;
};

export const renderPackageLabelPreviewImage = async (
  blob: Blob,
): Promise<string> => {
  const pdfjsLib = await getPdfJs();

  const arrayBuffer = await blob.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const page = await pdf.getPage(1);

  // scale 2 keeps the small label crisp when shown at preview size
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement("canvas");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/png");
};
