"use client";

import api from "@/lib/axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const Contactpage = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/contact/send", formData);

      toast.success("Your message has been sent successfully!");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact form error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-slate-50 py-24 text-slate-900"
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-400/20 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Globe2 size={16} />
            Global Logistics Solutions
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Let&apos;s Move Your Business{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Forward
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Have a logistics challenge, shipment requirement, or technology
            project in mind? Connect with Gilbrice Logistics and let&apos;s
            build a smarter shipping experience together.
          </p>
        </motion.div>

        {/* ======================================================
            TRUST STRIP
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Truck,
              title: "Global Shipping",
              text: "Air & sea logistics",
            },
            {
              icon: PackageCheck,
              title: "Shipment Tracking",
              text: "Real-time visibility",
            },
            {
              icon: ShieldCheck,
              title: "Reliable Service",
              text: "Secure logistics operations",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={23} />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>

                  <p className="text-sm text-slate-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ====================================================
              CONTACT FORM
          ==================================================== */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 md:p-10"
          >
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <MessageCircle size={22} />
              </div>

              <h3 className="text-3xl font-bold text-slate-900">
                Send Us a Message
              </h3>

              <p className="mt-2 text-slate-500">
                Tell us what you need and our team will get back to you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Subject */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Message */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us about your shipment, logistics requirement, or project..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Submit */}

              <button
                disabled={loading}
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}

                {!loading && (
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>
          </motion.div>

          {/* ====================================================
              BUSINESS INFORMATION
          ==================================================== */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {/* Company Card */}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 md:p-10">
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Building2 size={27} />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Our Company
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-900">
                    Gilbrice Logistics
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Global logistics and shipping solutions designed to make
                    transportation simpler, faster and more transparent.
                  </p>
                </div>
              </div>

              {/* Founder */}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Leadership
                </p>

                <h4 className="mt-2 text-lg font-bold text-slate-900">
                  Gaetan Gilbrice Tchewa
                </h4>

                <p className="mt-1 text-sm font-medium text-blue-600">
                  CEO & Founder
                </p>
              </div>

              {/* Locations */}

              <div className="mt-6 space-y-4">
                {/* USA */}

                <div className="flex gap-4 rounded-2xl border border-slate-100 p-5 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      USA Office
                    </p>

                    <h4 className="mt-1 font-semibold text-slate-900">
                      Reynoldsburg, OH 43068
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">United States</p>
                  </div>
                </div>

                {/* Cameroon */}

                <div className="flex gap-4 rounded-2xl border border-slate-100 p-5 transition hover:border-cyan-100 hover:bg-cyan-50/40">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Cameroon Office
                    </p>

                    <h4 className="mt-1 font-semibold text-slate-900">
                      Ancienne Route Bonaberi
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Douala, Cameroon — Next to DK Hotel
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Email */}

              <div className="mt-6 flex gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Mail size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Business Email
                  </p>

                  <h4 className="mt-1 break-all font-semibold text-slate-900">
                    @gilbricelogisticgrp.com
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Official company email domain
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl shadow-blue-600/20">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Truck size={24} />
                </div>

                <h3 className="text-2xl font-bold">
                  Need a Logistics Solution?
                </h3>

                <p className="mt-3 max-w-lg leading-7 text-blue-50/90">
                  From shipment management and customer tracking to complete
                  logistics operations, Gilbrice provides technology-driven
                  solutions for modern shipping businesses.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                  <span className="rounded-full bg-white/10 px-4 py-2">
                    Shipment Tracking
                  </span>

                  <span className="rounded-full bg-white/10 px-4 py-2">
                    Air & Sea Shipping
                  </span>

                  <span className="rounded-full bg-white/10 px-4 py-2">
                    Partner Management
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ======================================================
            FOOTER CONTACT
        ====================================================== */}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-blue-600" />
            <span>USA: +1 (304) 907-7812</span>
          </div>

          <span className="hidden text-slate-300 sm:block">•</span>

          <div className="flex items-center gap-2">
            <Globe2 size={15} className="text-cyan-600" />
            <span>USA • Cameroon • Global Operations</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactpage;
