"use client";

import { getMenus, type UserRole } from "@/lib/menuconfig";
import ProtectedRouteModal from "@/utils/ProtectedRouteModal";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose?: () => void;
  userRole?: UserRole;
}

export default function Sidebar({
  open,
  setOpen,
  onClose,
  userRole = "WAREHOUSE_EMPLOYEE",
}: SidebarProps) {
  /* accordion: শুধু একটা key ওপেন থাকবে */
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  /* collapsed sidebar hover flyout */
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState("");

  const router = useRouter();

  const menu = getMenus(userRole)[userRole] ?? [];

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const showFlyout = (key: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const el = itemRefs.current[key];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFlyoutPos({
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX + 8,
    });
    setFlyoutKey(key);
  };

  const scheduleHideFlyout = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setFlyoutKey(null), 150);
  };

  const cancelHideFlyout = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handleNavigation = () => {
    setFlyoutKey(null);
    onClose?.();
  };

  const handleProtectedRouteClick = (path: string) => {
    setTargetPath(path);
    setModalOpen(true);
    setFlyoutKey(null);
  };

  const handleConfirm = (password: string) => {
    const transactionPassword = process.env.NEXT_PUBLIC_TRANSACTION_PW;

    if (!transactionPassword) {
      console.error("NEXT_PUBLIC_TRANSACTION_PW is not configured.");
      alert("Protected route configuration is missing.");
      return;
    }

    if (password !== transactionPassword) {
      alert("Incorrect password");
      return;
    }

    router.push(targetPath);
    setModalOpen(false);
    onClose?.();
  };

  return (
    <>
      <motion.aside
        animate={{ width: open ? 280 : 64 }}
        transition={{ type: "tween", duration: 0.25 }}
        className="h-full bg-gradient-to-r from-slate-800 to-slate-700 dark:bg-gray-800 shadow-md flex flex-col overflow-hidden relative text-white"
      >
        {/* ===================== HEADER ===================== */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-600">
          {open && (
            <span className="text-sm font-bold text-white truncate">
              GILBRICE
            </span>
          )}

          <button
            type="button"
            onClick={() => (onClose ? onClose() : setOpen(!open))}
            aria-label={
              onClose
                ? "Close sidebar"
                : open
                  ? "Collapse sidebar"
                  : "Expand sidebar"
            }
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition ml-auto cursor-pointer"
          >
            {open || onClose ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ===================== NAVIGATION ===================== */}
        <nav className="flex-1 mt-2 overflow-y-auto px-2 space-y-0.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const isDropdown = Array.isArray(item.sub) && item.sub.length > 0;
            const dropdownKey = item.name.toLowerCase();
            const isOpenDropdown = openDropdown === dropdownKey;
            const isFlyoutOpen = flyoutKey === dropdownKey;

            return (
              <div
                key={item.name}
                onMouseEnter={() =>
                  !open && isDropdown && showFlyout(dropdownKey)
                }
                onMouseLeave={() => !open && isDropdown && scheduleHideFlyout()}
              >
                {isDropdown ? (
                  <button
                    ref={(el) => {
                      itemRefs.current[dropdownKey] = el;
                    }}
                    type="button"
                    onClick={() => open && toggleDropdown(dropdownKey)}
                    className="flex items-center w-full gap-3 px-2 py-2.5 rounded-xl hover:bg-white/10 transition group cursor-pointer"
                  >
                    <span className="text-gray-300 group-hover:text-white shrink-0 transition-colors">
                      <Icon size={20} />
                    </span>

                    {open && (
                      <>
                        <span className="font-medium text-gray-100 group-hover:text-white truncate">
                          {item.name}
                        </span>
                        <span className="ml-auto text-gray-400 group-hover:text-white shrink-0 transition-colors">
                          {isOpenDropdown ? (
                            <ChevronDown size={15} />
                          ) : (
                            <ChevronRight size={15} />
                          )}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/10 transition group"
                  >
                    <span className="text-gray-300 group-hover:text-white shrink-0 transition-colors">
                      <Icon size={20} />
                    </span>
                    {open && (
                      <span className="text-gray-100 group-hover:text-white truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}

                {/* ============ EXPANDED SIDEBAR: inline dropdown ============ */}
                <AnimatePresence initial={false}>
                  {isDropdown && isOpenDropdown && open && item.sub && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mt-0.5 mb-1 space-y-0.5 border-l-2 border-slate-600 pl-3">
                        {item.sub.map((sub) => {
                          const SubIcon = sub.icon;

                          if (sub.protectedPath) {
                            return (
                              <button
                                key={sub.name}
                                type="button"
                                onClick={() =>
                                  handleProtectedRouteClick(sub.protectedPath!)
                                }
                                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 w-full text-left text-gray-300 hover:text-white transition group"
                              >
                                {SubIcon && (
                                  <SubIcon
                                    size={15}
                                    className="shrink-0 text-gray-400 group-hover:text-blue-300 transition-colors"
                                  />
                                )}
                                <span className="truncate">{sub.name}</span>
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={sub.name}
                              href={sub.href || "#"}
                              onClick={handleNavigation}
                              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition group"
                            >
                              {SubIcon && (
                                <SubIcon
                                  size={15}
                                  className="shrink-0 text-gray-400 group-hover:text-blue-300 transition-colors"
                                />
                              )}
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ============ COLLAPSED SIDEBAR: hover flyout (portal) ============ */}
                {!open &&
                  isDropdown &&
                  isFlyoutOpen &&
                  item.sub &&
                  typeof window !== "undefined" &&
                  createPortal(
                    <div
                      style={{
                        position: "absolute",
                        top: flyoutPos.top,
                        left: flyoutPos.left,
                      }}
                      onMouseEnter={cancelHideFlyout}
                      onMouseLeave={scheduleHideFlyout}
                      className="min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl ring-1 ring-black/5 z-50 py-1.5 overflow-hidden divide-y divide-gray-100"
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {item.name}
                      </div>
                      {item.sub.map((sub) => {
                        const SubIcon = sub.icon;

                        if (sub.protectedPath) {
                          return (
                            <button
                              key={sub.name}
                              type="button"
                              onClick={() =>
                                handleProtectedRouteClick(sub.protectedPath!)
                              }
                              className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                            >
                              {SubIcon && (
                                <SubIcon
                                  size={15}
                                  className="shrink-0 text-gray-400 group-hover:text-blue-500"
                                />
                              )}
                              <span className="truncate">{sub.name}</span>
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={sub.name}
                            href={sub.href || "#"}
                            onClick={handleNavigation}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                          >
                            {SubIcon && (
                              <SubIcon
                                size={15}
                                className="shrink-0 text-gray-400 group-hover:text-blue-500"
                              />
                            )}
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>,
                    document.body,
                  )}
              </div>
            );
          })}
        </nav>

        {/* ===================== COLLAPSED INDICATOR ===================== */}
        {!open && (
          <div className="pb-4 flex justify-center">
            <div className="w-8 h-0.5 bg-slate-600 rounded" />
          </div>
        )}
      </motion.aside>

      <ProtectedRouteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
