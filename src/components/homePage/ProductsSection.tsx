"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  GraduationCap,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const products = [
  {
    title: "Biddaloy ERP",
    category: "Education",
    gradient: ["#1e3a8a", "#0891b2"],
    cardGlow: "rgba(8,145,178,0.35)",
    bgBase: "#050e1f",
    accentHex: "#0ea5e9",
    description:
      "Complete school, college and madrasa management platform with attendance, examinations and finance management.",
    features: [
      "Student Management",
      "Attendance Tracking",
      "Fee Collection",
      "Results Management",
      "Teacher Portal",
    ],
    dashboardType: "education",
  },
  {
    title: "Logistics ERP",
    category: "Logistics",
    gradient: ["#7c2d12", "#b45309"],
    cardGlow: "rgba(234,88,12,0.35)",
    bgBase: "#0f0800",
    accentHex: "#f97316",
    description:
      "Shipment, dispatch, fleet and customer management system for modern logistics companies.",
    features: [
      "Shipment Tracking",
      "Dispatch Management",
      "Customer Portal",
      "Analytics",
      "Fleet Monitoring",
    ],
    dashboardType: "logistics",
  },
  {
    title: "Business ERP",
    category: "Business",
    gradient: ["#4a1d96", "#9d174d"],
    cardGlow: "rgba(139,92,246,0.35)",
    bgBase: "#0a0010",
    accentHex: "#a855f7",
    description:
      "Complete inventory, accounting and operations management platform.",
    features: [
      "Inventory Control",
      "Sales Tracking",
      "Accounting",
      "Purchase Orders",
      "Reports",
    ],
    dashboardType: "business",
  },
  {
    title: "HR & Payroll",
    category: "Human Resource",
    gradient: ["#064e3b", "#065f46"],
    cardGlow: "rgba(16,185,129,0.35)",
    bgBase: "#000f08",
    accentHex: "#10b981",
    description:
      "Employee management, attendance, payroll and performance tracking.",
    features: [
      "Employee Database",
      "Payroll System",
      "Leave Management",
      "Attendance",
      "Performance Review",
    ],
    dashboardType: "hr",
  },
];

/* ─────────────────────────────────────────────
   DASHBOARDS
───────────────────────────────────────────── */
function EducationDashboard({ accent }: { accent: string }) {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Students", value: "1,248", Icon: GraduationCap },
          { label: "Teachers", value: "64", Icon: BookOpen },
          { label: "Attendance", value: "94%", Icon: CheckCircle2 },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Icon size={14} style={{ color: accent }} className="mb-1" />
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-white/40">{label}</div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-3 flex-1"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Weekly Attendance</div>
        <div className="flex items-end gap-1 h-16">
          {[70, 85, 92, 78, 95, 88, 94].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: "easeOut" }}
              className="flex-1 rounded-t-md"
              style={{ background: i === 6 ? accent : `${accent}55` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-white/30 mt-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Recent Results</div>
        {[
          ["Class 10A", "Math", "87%"],
          ["Class 9B", "Science", "91%"],
          ["Class 8C", "English", "79%"],
        ].map(([cls, sub, score]) => (
          <div
            key={cls}
            className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
          >
            <span className="text-white/70">{cls}</span>
            <span className="text-white/40">{sub}</span>
            <span style={{ color: accent }} className="font-bold">
              {score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogisticsDashboard({ accent }: { accent: string }) {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Shipments", value: "342", Icon: Package },
          { label: "On Route", value: "87", Icon: Truck },
          { label: "On-Time", value: "96%", Icon: TrendingUp },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Icon size={14} style={{ color: accent }} className="mb-1" />
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-white/40">{label}</div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl flex-1 relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-10">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>
        {[
          { x: 30, y: 40 },
          { x: 60, y: 25 },
          { x: 75, y: 60 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
            className="absolute w-3 h-3 rounded-full"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: accent }}
          />
        ))}
        <div className="absolute bottom-2 left-2 text-white/30 text-[10px]">
          Live Fleet Map
        </div>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {[
          { id: "SH-4821", dest: "Chittagong", status: "In Transit", pct: 65 },
          { id: "SH-4820", dest: "Sylhet", status: "Delivered", pct: 100 },
          { id: "SH-4819", dest: "Khulna", status: "Dispatched", pct: 30 },
        ].map((s) => (
          <div key={s.id} className="mb-2 last:mb-0">
            <div className="flex justify-between mb-1">
              <span className="text-white/70">
                {s.id} → {s.dest}
              </span>
              <span style={{ color: accent }}>{s.status}</span>
            </div>
            <div className="h-1 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: accent }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessDashboard({ accent }: { accent: string }) {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Revenue", value: "$4.2M", Icon: DollarSign },
          { label: "Orders", value: "1,093", Icon: ShoppingCart },
          { label: "Items", value: "4,821", Icon: ClipboardList },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Icon size={14} style={{ color: accent }} className="mb-1" />
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-white/40">{label}</div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-3 flex-1"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Monthly Revenue</div>
        <svg
          viewBox="0 0 200 70"
          className="w-full h-16"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L25,45 L50,50 L75,30 L100,35 L125,20 L150,25 L175,10 L200,15 L200,70 L0,70 Z"
            fill="url(#revGrad)"
          />
          <path
            d="M0,60 L25,45 L50,50 L75,30 L100,35 L125,20 L150,25 L175,10 L200,15"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
        </svg>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Top Products</div>
        {[
          ["Rice (50kg)", 88],
          ["Cooking Oil", 72],
          ["Sugar", 55],
        ].map(([name, pct]) => (
          <div key={name as string} className="mb-2 last:mb-0">
            <div className="flex justify-between mb-1">
              <span className="text-white/70">{name}</span>
              <span style={{ color: accent }}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: accent }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HRDashboard({ accent }: { accent: string }) {
  return (
    <div className="h-full w-full p-4 flex flex-col gap-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Employees", value: "248", Icon: Users },
          { label: "On Leave", value: "12", Icon: Calendar },
          { label: "Avg Score", value: "4.2★", Icon: UserCheck },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Icon size={14} style={{ color: accent }} className="mb-1" />
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-white/40">{label}</div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Payroll Breakdown</div>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 80 80" className="w-16 h-16">
            <circle
              cx="40"
              cy="40"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="28"
              fill="none"
              stroke={accent}
              strokeWidth="12"
              strokeDasharray="175.9"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 175.9 }}
              animate={{ strokeDashoffset: 175.9 * 0.3 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ transformOrigin: "center", rotate: "-90deg" }}
            />
          </svg>
          <div className="flex flex-col gap-1 text-white/60">
            <div>
              <span style={{ color: accent }}>■</span> Basic 70%
            </div>
            <div>
              <span className="text-white/30">■</span> Allowance 20%
            </div>
            <div>
              <span className="text-white/20">■</span> Bonus 10%
            </div>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl p-3 flex-1"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="text-white/50 mb-2">Today's Attendance</div>
        {[
          ["Rahim Ahmed", "Manager", "09:02"],
          ["Karim Hossain", "Engineer", "09:15"],
          ["Nadia Islam", "Designer", "09:08"],
          ["Farhan Ali", "Analyst", "09:21"],
        ].map(([name, role, time]) => (
          <div
            key={name}
            className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
          >
            <div>
              <div className="text-white/80">{name}</div>
              <div className="text-white/30 text-[10px]">{role}</div>
            </div>
            <div className="flex items-center gap-1" style={{ color: accent }}>
              <Clock size={10} />
              <span>{time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPreview({ type, accent }: { type: string; accent: string }) {
  const map: Record<string, React.ReactNode> = {
    education: <EducationDashboard accent={accent} />,
    logistics: <LogisticsDashboard accent={accent} />,
    business: <BusinessDashboard accent={accent} />,
    hr: <HRDashboard accent={accent} />,
  };
  return <>{map[type]}</>;
}

/* ─────────────────────────────────────────────
   MOUSE PARALLAX
───────────────────────────────────────────── */
function useMouseParallax() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mouseX, mouseY]);
  return { springX, springY };
}

/* ─────────────────────────────────────────────
   MAIN — full-height sticky, NO extra blank div
───────────────────────────────────────────── */
export default function ProductsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { springX, springY } = useMouseParallax();

  const rotateY = useTransform(springX, [-1, 1], [-5, 5]);
  const rotateX = useTransform(springY, [-1, 1], [3, -3]);
  const cardX = useTransform(springX, [-1, 1], [-10, 10]);
  const cardY = useTransform(springY, [-1, 1], [-6, 6]);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= products.length) return;
    setActiveIndex(idx);
    setLocked(true);
    setTimeout(() => setLocked(false), 900);
  }, []);

  /* ── Wheel handler ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      // Only intercept when section is the active viewport
      if (rect.top > 1 || rect.bottom < window.innerHeight - 1) return;

      if (locked) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0 && activeIndex < products.length - 1) {
        e.preventDefault();
        goTo(activeIndex + 1);
      } else if (e.deltaY < 0 && activeIndex > 0) {
        e.preventDefault();
        goTo(activeIndex - 1);
      }
      // If first/last product → let natural scroll pass through (no preventDefault)
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [activeIndex, locked, goTo]);

  /* ── Touch swipe ── */
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      if (dy > 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [activeIndex, goTo]);

  const product = products[activeIndex];

  return (
    /* KEY FIX: section is exactly 100vh — no multiplied height, no blank space */
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Background with smooth color transition */}
      <motion.div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: product.bgBase }}
      />

      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full blur-[140px] pointer-events-none"
        style={{ background: product.gradient[0] + "55" }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full blur-[140px] pointer-events-none"
        style={{ background: product.gradient[1] + "55" }}
      />

      {/* Stacked background cards */}
      {[2, 1].map((offset) => {
        const idx = (activeIndex + offset) % products.length;
        const p = products[idx];
        return (
          <motion.div
            key={`stack-${offset}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{
              y: offset * 18,
              scale: 1 - offset * 0.045,
              opacity: 1 - offset * 0.35,
              zIndex: 10 - offset,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-7xl w-full px-6">
              <div
                className="rounded-[40px] min-h-[80vh]"
                style={{
                  background: `linear-gradient(135deg,${p.gradient[0]},${p.gradient[1]})`,
                  opacity: 0.55,
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Dot nav */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-500"
            style={{
              width: activeIndex === i ? 10 : 8,
              height: activeIndex === i ? 36 : 8,
              background:
                activeIndex === i
                  ? product.accentHex
                  : "rgba(255,255,255,0.25)",
              boxShadow:
                activeIndex === i ? `0 0 12px ${product.accentHex}` : "none",
            }}
          />
        ))}
      </div>

      {/* Category pills */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 flex-wrap justify-center px-4">
        {products.map((p, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
            style={{
              background:
                activeIndex === i
                  ? product.accentHex
                  : "rgba(255,255,255,0.08)",
              color: activeIndex === i ? "#000" : "rgba(255,255,255,0.4)",
              backdropFilter: "blur(8px)",
            }}
          >
            {p.category}
          </button>
        ))}
      </div>

      {/* Main animated card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 200, scale: 0.88, rotateX: -8 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: -180, scale: 0.88, rotateX: 8 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center z-20"
          style={{ perspective: 1200 }}
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full">
            <motion.div
              style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
            >
              {/* Glow border */}
              <div
                className="rounded-[40px] p-[1px]"
                style={{
                  background: `linear-gradient(135deg,${product.accentHex}55,transparent,${product.accentHex}33)`,
                  boxShadow: `0 0 80px ${product.cardGlow}, 0 40px 100px rgba(0,0,0,0.6)`,
                }}
              >
                {/* Card body */}
                <div
                  className="rounded-[40px] overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg,${product.gradient[0]}ee,${product.gradient[1]}ee)`,
                  }}
                >
                  <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-14 items-center min-h-[80vh]">
                    {/* LEFT */}
                    <div className="text-white relative z-10">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                      >
                        <span
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: product.accentHex }}
                          />
                          {product.category}
                        </span>
                      </motion.div>

                      <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.25,
                          duration: 0.7,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="mt-6 font-black leading-[0.9] tracking-tighter"
                        style={{ fontSize: "clamp(2.5rem,5vw,5rem)" }}
                      >
                        {product.title}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.75 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-5 text-lg leading-relaxed max-w-md"
                      >
                        {product.description}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-8 space-y-3"
                      >
                        {product.features.map((feature, i) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.55 + i * 0.07,
                              duration: 0.4,
                            }}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle2
                              size={18}
                              style={{
                                color: product.accentHex,
                                flexShrink: 0,
                              }}
                            />
                            <span className="text-white/85">{feature}</span>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mt-10 flex items-center gap-3 flex-wrap"
                      >
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-sm transition-all hover:scale-105"
                          style={{
                            background: "rgba(255,255,255,0.95)",
                            color: product.gradient[0],
                          }}
                        >
                          Request Demo <ArrowRight size={16} />
                        </Link>
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-sm text-white/70 transition-all hover:text-white"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          Learn More
                        </Link>
                      </motion.div>
                    </div>

                    {/* RIGHT — dashboard */}
                    <motion.div
                      initial={{ opacity: 0, x: 40, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex justify-center"
                      style={{ x: cardX, y: cardY }}
                    >
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-full max-w-[440px]"
                        style={{
                          filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.5))",
                        }}
                      >
                        {/* Outer glass */}
                        <div
                          className="rounded-[28px] p-[1px]"
                          style={{
                            background:
                              "linear-gradient(145deg,rgba(255,255,255,0.25),rgba(255,255,255,0.05))",
                          }}
                        >
                          <div
                            className="rounded-[28px] p-4"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              backdropFilter: "blur(30px)",
                            }}
                          >
                            {/* Window chrome */}
                            <div className="flex items-center gap-2 mb-3">
                              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                                <div
                                  key={c}
                                  className="w-3 h-3 rounded-full"
                                  style={{ background: c }}
                                />
                              ))}
                              <div
                                className="flex-1 rounded-full h-5 mx-2 flex items-center px-3 text-white/30 text-[10px]"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                              >
                                app.
                                {product.category
                                  .toLowerCase()
                                  .replace(" ", "-")}
                                .erp
                              </div>
                            </div>
                            {/* Screen */}
                            <div
                              className="rounded-[18px] overflow-hidden"
                              style={{
                                background: "rgba(0,0,0,0.7)",
                                height: 400,
                                border: `1px solid ${product.accentHex}22`,
                              }}
                            >
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={`dash-${activeIndex}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                  }}
                                  className="h-full"
                                >
                                  <DashboardPreview
                                    type={product.dashboardType}
                                    accent={product.accentHex}
                                  />
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Scroll hint (first slide only) */}
      <AnimatePresence>
        {activeIndex === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
          >
            <span className="text-white/30 text-xs tracking-widest uppercase">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1"
            >
              <div className="w-1 h-2 rounded-full bg-white/40" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter */}
      <div className="absolute bottom-8 right-8 z-50 text-white/25 text-sm font-mono tabular-nums">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
        <span> / {String(products.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
