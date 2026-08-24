"use client";

import { ArrowRight, Globe2, PackageCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BannerSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Decorative shapes */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-secondary/10" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[50px] border-accent/10" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-24">
        {/* Content */}
        <div className="text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <Globe2 size={16} className="text-accent" />
            Global Logistics Partner
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Delivering Trust.
            <span className="block text-accent">Connecting the World.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
            Gilbrice Logistics provides dependable international shipping and
            logistics solutions for businesses and individuals. From air freight
            to courier delivery, we help move your shipment safely and
            efficiently.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/tracking"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-accent-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Track Shipment
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-5 sm:grid-cols-3">
            <div className="border-l border-white/15 pl-4">
              <PackageCheck className="mb-2 text-accent" size={21} />
              <p className="text-sm font-semibold">Safe Handling</p>
            </div>

            <div className="border-l border-white/15 pl-4">
              <ShieldCheck className="mb-2 text-accent" size={21} />
              <p className="text-sm font-semibold">Secure Shipping</p>
            </div>

            <div className="hidden border-l border-white/15 pl-4 sm:block">
              <Globe2 className="mb-2 text-accent" size={21} />
              <p className="text-sm font-semibold">Worldwide Reach</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
            <div className="relative h-[360px] overflow-hidden rounded-[1.5rem] sm:h-[450px]">
              <Image
                src="/images/logistics-about.jpg"
                alt="Gilbrice Logistics"
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-accent">
                  Gilbrice Logistics
                </p>

                <p className="mt-2 text-lg font-bold">
                  Your shipment. Our responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
