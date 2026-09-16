"use client";

import Sidebar from "@/components/dashboard/SideBar";
import { logout, selectCurrentUser } from "@/Redux/Features/Auth/authSlice";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const currentUser = useSelector(selectCurrentUser);

  const role = currentUser?.role;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const roleLabel: Record<string, string> = {
    GILBRICE_SUPER_ADMIN: "Super Admin",
    GILBRICE_ADMIN: "Admin",
    GILBRICE_FINANCE: "Finance",

    OWNER: "Owner",
    MANAGER: "Manager",
    WAREHOUSE_EMPLOYEE: "Warehouse Employee",
    CASHIER: "Cashier",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block shrink-0">
        {role && <Sidebar open={open} setOpen={setOpen} userRole={role} />}
      </div>

      {/* MOBILE SIDEBAR — unchanged */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-30 h-full md:hidden">
            {role && (
              <Sidebar
                open={true}
                setOpen={() => {}}
                userRole={role}
                onClose={() => setMobileOpen(false)}
              />
            )}
          </div>
        </>
      )}

      {/* RIGHT SIDE */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Mobile Menu */}

          <button
            type="button"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Dashboard Title */}

          <h1 className="hidden text-base font-semibold text-gray-700 dark:text-gray-200 md:block">
            Dashboard
          </h1>

          {/* =================================================
              USER INFO
          ================================================== */}

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium leading-tight text-gray-800 dark:text-gray-100">
                {currentUser?.name || currentUser?.email || "User"}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser?.role
                  ? (roleLabel[currentUser.role] ?? currentUser.role)
                  : ""}
              </p>
            </div>

            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
