"use client";

import { motion } from "framer-motion";
import { Linkedin, UserRound } from "lucide-react";

const team = [
  {
    name: "Gilbrice Logistics",
    role: "Management Team",
    description:
      "Dedicated to building reliable and efficient international logistics solutions.",
  },
  {
    name: "Operations Team",
    role: "Logistics Operations",
    description:
      "Focused on shipment coordination, handling, documentation, and operational excellence.",
  },
  {
    name: "Customer Support",
    role: "Customer Experience",
    description:
      "Helping customers stay informed and supported throughout their shipment journey.",
  },
];

const TeamSection = () => {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            Our People
          </span>

          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            The Team Behind Your Shipment
          </h2>

          <p className="mt-4 leading-7 text-gray-500">
            A professional team working together to make every shipment
            smoother, safer, and more reliable.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary transition group-hover:bg-secondary group-hover:text-white ">
                <UserRound size={32} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                {member.name}
              </h3>

              <p className="mt-1 text-sm font-semibold text-secondary">
                {member.role}
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                {member.description}
              </p>

              <button
                type="button"
                className="mx-auto mt-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-secondary hover:text-white"
              >
                <Linkedin size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
