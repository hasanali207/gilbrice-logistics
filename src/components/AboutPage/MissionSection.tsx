"use client";

import { motion } from "framer-motion";
import { Globe2, ShieldCheck, Target, Truck, Zap } from "lucide-react";

const MissionSection = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-secondary/5 px-4 py-2 text-sm font-semibold text-secondary">
            <Target size={16} />
            Our Mission
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Moving Your Business
            <span className="text-secondary"> Beyond Borders</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
            At Gilbrice Logistics, our mission is to make international shipping
            simple, reliable, and accessible. We connect businesses and
            customers with efficient logistics solutions designed around speed,
            security, and transparency.
          </p>
        </motion.div>

        {/* Mission cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Globe2,
              title: "Global Reach",
              text: "Reliable logistics connections across international destinations.",
            },
            {
              icon: ShieldCheck,
              title: "Secure Handling",
              text: "Your shipments are handled with care throughout the journey.",
            },
            {
              icon: Zap,
              title: "Fast Service",
              text: "Efficient shipping processes designed to save valuable time.",
            },
            {
              icon: Truck,
              title: "Reliable Delivery",
              text: "Professional logistics support from pickup to destination.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/20 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                  <Icon size={23} />
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
