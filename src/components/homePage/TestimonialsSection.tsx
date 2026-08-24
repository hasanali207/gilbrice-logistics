"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: PackageCheck,
    title: "Smarter Shipment Management",
    description:
      "Manage bookings, shipments, warehouse operations, and delivery status through one connected platform.",
  },
  {
    icon: Users,
    title: "Partner-Centric Operations",
    description:
      "Give every partner the tools they need to manage customers, shipments, payments, and daily operations independently.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Controlled Access",
    description:
      "Role-based access keeps sensitive customer, financial, and operational information secure across the platform.",
  },
  {
    icon: BarChart3,
    title: "Clear Business Insights",
    description:
      "Track shipments, payments, balances, and operational performance with accurate and accessible data.",
  },
  {
    icon: Globe2,
    title: "Ready for Global Growth",
    description:
      "Built with scalability in mind for multiple partners, warehouses, countries, and growing shipment volumes.",
  },
  {
    icon: CheckCircle2,
    title: "Reliable Workflows",
    description:
      "Standardized processes reduce manual work, improve accuracy, and help teams deliver a consistent customer experience.",
  },
];

export default function WhatWeDeliver() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            What We Deliver
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Technology That Moves
            <span className="block text-slate-400">Your Business Forward</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Powerful tools, connected workflows, and reliable infrastructure
            designed to help shipping partners operate efficiently and grow with
            confidence.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/60"
              >
                {/* subtle corner accent on hover */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-500/0 transition-colors duration-300 group-hover:bg-teal-500/5" />

                {/* Icon */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 transition-colors duration-300 group-hover:bg-teal-700">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>

                {/* Content */}
                <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-slate-900">
                  {benefit.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-slate-500">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA / Statement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 px-7 py-12 text-center sm:px-12"
        >
          {/* accent glow inside CTA */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-teal-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-amber-400/10 blur-[100px]" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Gilbrice Platform
            </span>

            <h3 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              One Platform. Complete Control.
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              From the first shipment booking to final delivery, Gilbrice
              connects your people, partners, and operations in one reliable
              ecosystem.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
