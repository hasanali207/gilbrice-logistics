"use client";

import { motion } from "framer-motion";
import { ArrowRight, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
      {/* Decorative glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium"
        >
          <PackageSearch size={16} />
          Join The Gilbrice Network
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-4xl lg:text-6xl font-bold text-white"
        >
          Ready To Ship With Confidence?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto"
        >
          Whether you're tracking a package or growing your own shipping
          business as a partner, Gilbrice Logistics gives you the network,
          tools, and support to get there.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold hover:bg-slate-100 hover:scale-[1.03] transition-all"
          >
            Track a Shipment
            <ArrowRight size={20} />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white text-white hover:bg-white/10 hover:scale-[1.03] transition-all"
          >
            Become a Partner
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
