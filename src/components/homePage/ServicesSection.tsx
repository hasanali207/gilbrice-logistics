"use client";

import { motion } from "framer-motion";
import {
  Building2,
  ClipboardList,
  PackageSearch,
  Percent,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Multi-Partner Accounts",
    description:
      "Independent partner companies each manage their own customers, staff roles, and shipments — fully isolated from every other partner.",
  },
  {
    icon: PackageSearch,
    title: "Real-Time Shipment Tracking",
    description:
      "Customers track packages by tracking number with no login required — status, weight, dates, and full shipment timeline.",
  },
  {
    icon: Percent,
    title: "Two-Level Pricing",
    description:
      "Set wholesale partner rates and retail customer rates separately, with margins kept private and permission-controlled.",
  },
  {
    icon: QrCode,
    title: "Barcode & QR Scanning",
    description:
      "Every package gets a scannable code — update status at received, weighed, loaded, departed, and delivered stages from any phone.",
  },
  {
    icon: ClipboardList,
    title: "Master Manifests & Reports",
    description:
      "Consolidate packages from multiple partners into one departure manifest, with exportable financial and operational reports.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Audit Trail",
    description:
      "Partner data stays fully isolated at the access-control level, with a complete audit log of every change made.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-teal-700 font-semibold uppercase tracking-wider">
            Platform Features
          </span>

          <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-slate-900">
            One Network. Every Partner. Full Visibility.
          </h2>

          <p className="mt-6 text-slate-600 text-lg">
            Gilbrice Logistics gives partners the tools to manage their own
            customers and shipments, while keeping every partner&apos;s data
            secure and separate.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={index}
                className="group rounded-3xl border border-slate-200 p-8 hover:border-teal-600 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-teal-700 group-hover:text-amber-600 transition-colors duration-300" />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-4 text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
