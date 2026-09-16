"use client";

import { motion } from "framer-motion";
import { ArrowRight, PackageSearch, Search, Ship } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

const HeroSection = () => {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = trackingNumber.trim();

    if (!trimmed) {
      setError("Please enter a tracking number.");
      return;
    }

    setError("");
    router.push(`/tracking/${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative overflow-hidden bg-background flex items-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm text-secondary font-medium">
              🚚 Multi-Partner Freight Network • Air & Sea Cargo
            </span>

            <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Ship Anywhere.
              <br />
              <span className="text-primary">Track Everything.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Gilbrice Logistics connects independent shipping partners with
              customers worldwide — real-time tracking, transparent rates, and a
              single network you can trust from pickup to delivery.
            </p>

            {/* Tracking Search */}
            <form
              onSubmit={handleTrack}
              className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl"
            >
              <div className="flex-1 flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 shadow-sm focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15 transition-colors">
                <Search size={18} className="text-muted-foreground shrink-0" />

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number, e.g. GL-260810-00125"
                  className="w-full py-3.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shrink-0"
              >
                Track a Shipment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            {error && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {error}
              </p>
            )}

            <div className="mt-6">
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground bg-card hover:bg-muted cursor-pointer"
                >
                  <Ship className="mr-2 h-5 w-5" />
                  Become a Partner
                </Button>
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6">
              <div>
                <h3 className="text-3xl font-bold text-foreground">40+</h3>
                <p className="text-muted-foreground">Partner Companies</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground">15K+</h3>
                <p className="text-muted-foreground">Shipments Tracked</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground">12</h3>
                <p className="text-muted-foreground">Countries Served</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Tracking Card Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl">
              {/* dummy image - replace with real tracking dashboard screenshot */}
              <Image
                src="/banner.jpg"
                alt="Gilbrice Logistics"
                width={1250}
                height={150}
                className="rounded-xl"
                loading="eager"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-25 -left-6 rounded-2xl bg-primary p-5 shadow-xl"
            >
              <PackageSearch className="h-5 w-5 text-gray-500 mb-1" />
              <h4 className="text-lg font-bold text-primary-foreground">
                GL-260810-00125
              </h4>
              <p className="text-gray-500 text-sm">In Transit → USA/UK</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -top-20 -right-6 rounded-2xl bg-card border border-border p-5 shadow-xl"
            >
              <h4 className="text-2xl font-bold text-foreground">24/7</h4>
              <p className="text-muted-foreground text-sm">Live Tracking</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
