// app/layout.tsx

import Providers from "@/providers/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gilbrice Logistics | Global Shipping & Logistics Solutions",
    template: "%s | Gilbrice Logistics",
  },

  description:
    "Gilbrice Logistics provides reliable international shipping, freight forwarding, courier, air freight, sea freight, and logistics solutions for businesses and individuals worldwide.",

  keywords: [
    "Gilbrice Logistics",
    "Logistics",
    "Shipping",
    "International Shipping",
    "Freight Forwarding",
    "Air Freight",
    "Sea Freight",
    "Road Freight",
    "Courier Service",
    "Cargo Service",
    "Global Logistics",
    "Parcel Delivery",
    "Shipment Tracking",
    "International Courier",
  ],

  authors: [
    {
      name: "Gilbrice Logistics",
    },
  ],

  creator: "Gilbrice Logistics",
  publisher: "Gilbrice Logistics",

  metadataBase: new URL("https://gilbricelogisticgrp.com"),

  openGraph: {
    title: "Gilbrice Logistics | Global Shipping & Logistics Solutions",

    description:
      "Reliable international shipping, freight forwarding, courier, and logistics solutions designed to move your packages safely and efficiently.",

    url: "https://gilbricelogisticgrp.com",

    siteName: "Gilbrice Logistics",

    images: [
      {
        url: "https://gilbricelogisticgrp.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gilbrice Logistics",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Gilbrice Logistics | Global Shipping & Logistics Solutions",

    description:
      "International shipping, freight forwarding, courier, and logistics solutions from Gilbrice Logistics.",

    images: ["https://gilbricelogisticgrp.com/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
