"use client";

import { getMenus, type UserRole } from "@/lib/menuconfig";
import ProtectedRouteModal from "@/utils/ProtectedRouteModal";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [dropdown, setDropdown] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState("");

  const router = useRouter();

  /**
   * Get menu based on authenticated user's role.
   */
  const menu = getMenus(userRole)[userRole] ?? [];
  /**
   * Toggle dropdown menu.
   */
  const toggleDropdown = (name: string) => {
    setDropdown((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  /**
   * Close mobile sidebar after navigation.
   */
  const handleNavigation = () => {
    onClose?.();
  };

  /**
   * Open protected route confirmation modal.
   */
  const handleProtectedRouteClick = (path: string) => {
    setTargetPath(path);
    setModalOpen(true);
  };

  /**
   * Confirm protected route access.
   *
   * NOTE:
   * This is only a frontend confirmation layer.
   * Real authorization MUST still be handled by backend middleware.
   */
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
        animate={{
          width: open ? 280 : 64,
        }}
        transition={{
          type: "tween",
          duration: 0.25,
        }}
        className="h-screen bg-white dark:bg-gray-800 shadow-md flex flex-col overflow-hidden relative"
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex items-center justify-between px-3 py-4 border-b dark:border-gray-700">
          {open && (
            <span className="text-sm font-bold text-blue-600 truncate">
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
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition ml-auto"
          >
            {open || onClose ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <nav className="flex-1 mt-2 overflow-y-auto px-2 space-y-0.5">
          {menu.map((item) => {
            const Icon = item.icon;

            const isDropdown = Array.isArray(item.sub) && item.sub.length > 0;

            const dropdownKey = item.name.toLowerCase();

            const isOpenDropdown = dropdown[dropdownKey] ?? false;

            return (
              <div key={item.name}>
                {/* =================================================
                    DROPDOWN MENU
                ================================================== */}
                {isDropdown ? (
                  <button
                    type="button"
                    onClick={() => toggleDropdown(dropdownKey)}
                    className="flex items-center w-full gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition group cursor-pointer"
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 shrink-0">
                      <Icon size={20} />
                    </span>

                    {open && (
                      <>
                        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 truncate">
                          {item.name}
                        </span>

                        <span className="ml-auto text-gray-400 shrink-0">
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
                  /* =================================================
                     NORMAL LINK
                  ================================================== */
                  <Link
                    href={item.href || "#"}
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition group"
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 shrink-0">
                      <Icon size={20} />
                    </span>

                    {open && (
                      <span className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}

                {/* =================================================
                    DROPDOWN CHILDREN
                ================================================== */}
                <AnimatePresence initial={false}>
                  {isDropdown && isOpenDropdown && open && item.sub && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mt-0.5 mb-1 space-y-0.5 border-l-2 border-blue-100 dark:border-gray-600 pl-3">
                        {item.sub.map((sub) => {
                          const SubIcon = sub.icon;

                          /* =====================================
                               PROTECTED ROUTE
                            ====================================== */
                          if (sub.protectedPath) {
                            return (
                              <button
                                key={sub.name}
                                type="button"
                                onClick={() =>
                                  handleProtectedRouteClick(sub.protectedPath!)
                                }
                                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 transition group"
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

                          /* =====================================
                               NORMAL CHILD LINK
                            ====================================== */
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href || "#"}
                              onClick={handleNavigation}
                              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition group"
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* =====================================================
            COLLAPSED SIDEBAR INDICATOR
        ====================================================== */}
        {!open && (
          <div className="pb-4 flex justify-center">
            <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        )}
      </motion.aside>

      {/* =======================================================
          PROTECTED ROUTE MODAL
      ======================================================== */}
      <ProtectedRouteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
