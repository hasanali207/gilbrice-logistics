"use client";

import { LucideIcon, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface DropdownItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
}

interface ActionDropdownProps {
  items: DropdownItem[];
  menuWidth?: number;
  triggerTitle?: string;
}

export default function ActionDropdown({
  items,
  menuWidth = 200,
  triggerTitle = "More actions",
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenu = () => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const estimatedHeight = items.length * 40 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow < estimatedHeight
        ? rect.top + window.scrollY - estimatedHeight
        : rect.bottom + window.scrollY + 4;

    setPos({
      top,
      left: rect.right + window.scrollX - menuWidth,
    });
    setOpen(true);
  };

  const toggle = () => (open ? setOpen(false) : openMenu());

  /* close on outside click */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !btnRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  /* keep position correct on scroll/resize while open */
  useEffect(() => {
    if (!open) return;

    const updatePos = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const estimatedHeight = items.length * 40 + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < estimatedHeight
          ? rect.top + window.scrollY - estimatedHeight
          : rect.bottom + window.scrollY + 4;

      setPos({ top, left: rect.right + window.scrollX - menuWidth });
    };

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, items.length, menuWidth]);

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={toggle}
        title={triggerTitle}
        className={`p-2 rounded-md border transition-colors cursor-pointer ${
          open
            ? "border-blue-300 bg-blue-50 text-blue-600"
            : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        <MoreVertical size={14} />
      </button>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: menuWidth,
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-xl ring-1 ring-black/5 z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right divide-y divide-gray-100"
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0 mr-2 ${
                      item.danger
                        ? "bg-red-50 text-red-500 group-hover:bg-red-100"
                        : "bg-gray-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              );

              const className = `group flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`;

              return item.href ? (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={`w-full text-left ${className}`}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
