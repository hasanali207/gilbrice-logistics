"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Package, Plane, Truck } from "lucide-react";

const WorkingSection = () => {
  const steps = [
    {
      number: "01",
      icon: ClipboardCheck,
      title: "Book Your Shipment",
      description:
        "Provide your shipment details, destination, weight, and preferred shipping method.",
    },
    {
      number: "02",
      icon: Package,
      title: "Shipment Processing",
      description:
        "Our logistics team verifies, prepares, and securely processes your shipment.",
    },
    {
      number: "03",
      icon: Plane,
      title: "International Transit",
      description:
        "Your shipment moves through our logistics network toward its destination.",
    },
    {
      number: "04",
      icon: Truck,
      title: "Final Delivery",
      description:
        "We coordinate the final delivery so your package reaches its destination safely.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            Simple Process
          </span>

          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            How Gilbrice Logistics Works
          </h2>

          <p className="mt-4 leading-7 text-gray-500">
            From booking to delivery, we keep the shipping process simple,
            transparent, and easy to follow.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-secondary/15 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-8 border-gray-50 bg-secondary text-white shadow-lg">
                  <Icon size={27} />
                </div>

                <span className="text-xs font-bold tracking-widest text-accent">
                  STEP {step.number}
                </span>

                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkingSection;
