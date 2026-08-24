"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clock3,
  Headphones,
  Layers3,
  Lock,
  Rocket,
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Fast & Reliable Delivery",
    description:
      "Streamlined air and sea freight workflows keep every shipment moving efficiently from booking to final delivery.",
  },
  {
    icon: Lock,
    title: "Secure Partner Data",
    description:
      "Customer information, rates, payments, and business data remain isolated and protected through role-based access control.",
  },
  {
    icon: Headphones,
    title: "Dedicated Partner Support",
    description:
      "Get dependable support for managing customers, shipments, payments, and day-to-day logistics operations.",
  },
  {
    icon: Clock3,
    title: "Built to Scale",
    description:
      "A scalable platform designed to support growing partner networks, multiple warehouses, and international operations.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent Pricing",
    description:
      "Wholesale and retail rates are calculated clearly, with complete payment records, balances, and transaction history.",
  },
  {
    icon: Layers3,
    title: "Complete Shipment Visibility",
    description:
      "Track every shipment milestone from receiving and processing to dispatch and final delivery in one place.",
  },
];

const stats = [
  { value: "40+", label: "Partner Companies" },
  { value: "12", label: "Countries Served" },
  { value: "15K+", label: "Shipments Tracked" },
  { value: "99%", label: "On-Time Delivery" },
];

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-amber-400/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
            Why Choose Us
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Built for Partners.
            <span className="block text-slate-400">Designed for Growth.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            One powerful platform for independent shipping partners to manage
            their operations, serve customers, and grow with confidence.
          </p>
        </motion.div>

        {/* Features */}
        <div className="relative mt-20 lg:mt-24">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-teal-500/30 to-transparent md:block" />

          <div className="space-y-8 md:space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={feature.title}
                  className={`relative flex flex-col items-center md:flex-row ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                  initial={{
                    opacity: 0,
                    x: isEven ? -25 : 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  {/* Content */}
                  <div
                    className={`w-full md:w-[46%] ${
                      isEven
                        ? "md:pr-12 md:text-right"
                        : "md:pl-12 md:text-left"
                    }`}
                  >
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-sm transition-all duration-300 hover:border-teal-400/20 hover:bg-white/[0.04]">
                      <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                        {feature.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-[15px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 my-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-slate-900 shadow-[0_0_30px_rgba(20,184,166,0.12)] md:my-0">
                    <Icon className="h-6 w-6 text-amber-400" />

                    <span className="absolute inset-0 -z-10 rounded-2xl bg-teal-400/5 blur-xl" />
                  </div>

                  {/* Empty Side */}
                  <div className="hidden w-[46%] md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] sm:grid-cols-4 lg:mt-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-7 text-center sm:px-6 ${
                index !== 0
                  ? "border-white/[0.07] max-sm:border-t sm:border-l"
                  : ""
              }`}
            >
              <h4 className="text-3xl font-bold tracking-tight text-amber-400 sm:text-4xl">
                {stat.value}
              </h4>

              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Bottom statement */}
        <motion.div
          className="mx-auto mt-14 max-w-2xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm leading-6 text-slate-500">
            A connected logistics ecosystem that gives partners the tools,
            visibility, and control they need to operate with confidence.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
