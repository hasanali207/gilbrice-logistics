"use client";

import { Clock3, Package, Search, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TrackSearchPage = () => {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = trackingNumber.trim();

    if (!trimmed) {
      setError("Please enter a tracking number.");
      return;
    }

    setError("");

    // Redirect to the result page: /tracking/[trackingNumber]
    router.push(`/tracking/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ======================================================
          HERO / SEARCH BOX
      ====================================================== */}

      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-6">
            <Package size={26} />
          </div>

          <p className="text-sm text-white/70 mb-2">Gilbrice Logistics</p>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Track Your Shipment
          </h1>

          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Enter your tracking number below to see real-time status and
            delivery updates.
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-3 md:p-3 flex flex-col md:flex-row items-stretch gap-3"
          >
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4">
              <Search size={18} className="text-muted-foreground shrink-0" />

              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. GB123456789"
                className="w-full py-3.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Track Shipment
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-200 font-medium">{error}</p>
          )}
        </div>
      </section>

      {/* ======================================================
          INFO STRIP
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Truck size={20} className="text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Real-Time Updates
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your shipment&apos;s journey step by step.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Secure & Reliable
            </h3>
            <p className="text-sm text-muted-foreground">
              Your shipment details are safe with us.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Clock3 size={20} className="text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              24/7 Availability
            </h3>
            <p className="text-sm text-muted-foreground">
              Check your status anytime, anywhere.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TrackSearchPage;
