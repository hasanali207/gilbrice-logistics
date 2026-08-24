"use client";

import { motion } from "framer-motion";
import {
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

export function EducationDashboard({ accent }: { accent: string }) {
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

export function LogisticsDashboard({ accent }: { accent: string }) {
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

export function BusinessDashboard({ accent }: { accent: string }) {
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

export function HRDashboard({ accent }: { accent: string }) {
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
