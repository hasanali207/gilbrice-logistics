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

export const packageLabelPdf = async (data: LabelData) => {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default;

  pdfMake.vfs = { "SolaimanLipi.ttf": SolaimanLipiBase64 };
  pdfMake.fonts = {
    SolaimanLipi: {
      normal: "SolaimanLipi.ttf",
      bold: "SolaimanLipi.ttf",
      italics: "SolaimanLipi.ttf",
      bolditalics: "SolaimanLipi.ttf",
    },
  };

  console.log("Generating PDF for package label:", data);

  const { package: pkg, shipment, customer, partner, codes } = data;

  const dimensions =
    pkg.lengthCm && pkg.widthCm && pkg.heightCm
      ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} CM`
      : "N/A";

  /*
   * 100mm × 150mm label
   *
   * pdfMake unit = point
   * 100mm ≈ 283pt
   * 150mm ≈ 425pt
   */
  const docDefinition: any = {
    pageSize: {
      width: 283.46,
      height: 425.2,
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
                text: partner.companyName,
                fontSize: 13,
                bold: true,
                alignment: "left",
              },
              partner.trackingPrefix
                ? {
                    text: partner.trackingPrefix,
                    fontSize: 7,
                    color: "#666666",
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
                color: "#666666",
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

      // separator
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 259,
            y2: 0,
            lineWidth: 1.2,
          },
        ],
        margin: [0, 0, 0, 6],
      },

      // =====================================================
      // PACKAGE CODE
      // =====================================================

      {
        text: pkg.packageCode,
        fontSize: 19,
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

      {
        text: codes.packageCode,
        fontSize: 8,
        alignment: "center",
        characterSpacing: 1,
        margin: [0, 0, 0, 6],
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
              {
                text: "SCAN QR",
                fontSize: 6,
                alignment: "center",
                color: "#777777",
                margin: [0, 2, 0, 0],
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
                color: "#777777",
              },
              {
                text: shipment.origin || "N/A",
                fontSize: 10,
                bold: true,
                margin: [0, 1, 0, 6],
              },

              {
                text: "TO",
                fontSize: 6,
                bold: true,
                color: "#777777",
              },
              {
                text: shipment.destination || "N/A",
                fontSize: 11,
                bold: true,
                margin: [0, 1, 0, 7],
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
                text: pkg.description || "N/A",
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
                      text: customer.fullName,
                      style: "value",
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
                            text: customer.address,
                            style: "value",
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
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 259,
            y2: 0,
            lineWidth: 0.8,
          },
        ],
        margin: [0, 2, 0, 4],
      },

      {
        text: partner.companyName,
        fontSize: 7,
        bold: true,
        alignment: "center",
      },

      {
        text: "Handle with care",
        fontSize: 6,
        color: "#777777",
        alignment: "center",
        margin: [0, 2, 0, 0],
      },
    ],

    defaultStyle: {
      font: "SolaimanLipi",
      fontSize: 8,
    },

    styles: {
      label: {
        fontSize: 6,
        bold: true,
        color: "#666666",
      },

      value: {
        fontSize: 7.5,
        bold: true,
      },
    },
  };

  const pdf = pdfMake.createPdf(docDefinition);

  pdf.open();
};
