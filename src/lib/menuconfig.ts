import {
  BarChart3,
  CalendarClock,
  FileDown,
  FileIcon,
  Home,
  KeySquareIcon,
  LogOut,
  NotebookPen,
  Package,
  ScanLine,
  Settings,
  Truck,
  UserPlus,
  UserRoundSearch,
  Users,
  Wallet,
} from "lucide-react";

import { getDashboardPath } from "./route";

export interface MenuItem {
  name: string;
  icon: any;
  href?: string;
  sub?: MenuItem[];
  protectedPath?: string;
}

export type UserRole =
  | "GILBRICE_SUPER_ADMIN"
  | "GILBRICE_ADMIN"
  | "GILBRICE_FINANCE"
  | "OWNER"
  | "MANAGER"
  | "WAREHOUSE_EMPLOYEE"
  | "CASHIER";

/* ============================================================
   getMenus(role)

   NOTE: This is a plain function, NOT a hook. It must be called
   from inside a component's render body (or another hook), and
   it must be passed the role explicitly — it does not read from
   Redux itself. This avoids the "Invalid hook call" error caused
   by calling useAppSelector at module top-level.

   Every route under the GILBRICE admin menu is normalized to the
   "/superadmin/..." prefix, and every "create" route follows the
   same "/superadmin/<module>/create" pattern.
============================================================ */
export const getMenus = (
  role: UserRole | null | undefined,
): Record<UserRole, MenuItem[]> => {
  const basePath = getDashboardPath(role);

  /* ---------------- GILBRICE ADMIN MENU ---------------- */
  const gilbriceAdminMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: basePath,
    },

    /* ---------------- SHIPMENTS ---------------- */
    {
      name: "Shipments",
      icon: Truck,
      sub: [
        {
          name: "All Shipments",
          icon: FileDown,
          href: `${basePath}/shipments`,
        },
        {
          name: "Create Shipment",
          icon: UserPlus,
          href: `${basePath}/shipments/create`,
        },
      ],
    },

    /* ---------------- PACKAGES ---------------- */
    {
      name: "Packages",
      icon: Package,
      sub: [
        {
          name: "Package Scan",
          icon: ScanLine,
          href: `${basePath}/packages/scan`,
        },
        {
          name: "Scan History",
          icon: CalendarClock,
          href: `${basePath}/packages/scan-history`,
        },
      ],
    },

    /* ---------------- MANIFESTS ---------------- */
    {
      name: "Manifests",
      icon: NotebookPen,
      sub: [
        {
          name: "All Manifests",
          icon: FileIcon,
          href: `${basePath}/manifests`,
        },
        {
          name: "Create Manifest",
          icon: UserPlus,
          href: `${basePath}/manifests/create`,
        },
        {
          name: "Manifest Packages",
          icon: FileDown,
          href: `${basePath}/manifests/packages`,
        },
      ],
    },

    /* ---------------- CUSTOMERS ---------------- */
    {
      name: "Customers",
      icon: Users,
      sub: [
        {
          name: "All Customers",
          icon: UserRoundSearch,
          href: `${basePath}/customers/allcustomers`,
        },
        {
          name: "Add Customer",
          icon: UserPlus,
          href: `${basePath}/customers/create`,
        },
      ],
    },

    /* ---------------- PARTNERS ---------------- */
    {
      name: "Partners",
      icon: Users,
      sub: [
        {
          name: "All Partners",
          icon: UserRoundSearch,
          href: `${basePath}/partners`,
        },
        {
          name: "Add Partner",
          icon: UserPlus,
          href: `${basePath}/partners/create`,
        },
      ],
    },

    /* ---------------- PAYMENTS ---------------- */
    {
      name: "Payments",
      icon: Wallet,
      sub: [
        {
          name: "All Payments",
          icon: BarChart3,
          href: `${basePath}/payments`,
        },
      ],
    },

    /* ---------------- USER (GILBRICE STAFF) ---------------- */
    {
      name: "User",
      icon: Users,
      sub: [
        {
          name: "All User",
          icon: UserRoundSearch,
          href: `${basePath}/user`,
        },
        {
          name: "Add User",
          icon: UserPlus,
          href: `${basePath}/user/create`,
        },
      ],
    },

    /* ---------------- REPORTS ---------------- */
    {
      name: "Reports",
      icon: BarChart3,
      sub: [
        {
          name: "Shipment Reports",
          icon: FileDown,
          href: `${basePath}/reports/shipments`,
        },
        {
          name: "Payment Reports",
          icon: FileDown,
          href: `${basePath}/reports/payments`,
        },
        {
          name: "Partner Ledger",
          icon: FileDown,
          href: `${basePath}/reports/parnter-ledger`,
        },
      ],
    },

    /* ---------------- SETTINGS ---------------- */
    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Profile",
          icon: Settings,
          href: `${basePath}/profile`,
        },
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ---------------- GILBRICE FINANCE MENU ---------------- */
  const gilbriceFinanceMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: `${basePath}/finance`,
    },

    {
      name: "Payments",
      icon: Wallet,
      sub: [
        {
          name: "All Payments",
          icon: BarChart3,
          href: `${basePath}/payments`,
        },
        {
          name: "Record Payment",
          icon: UserPlus,
          href: `${basePath}/payments/create`,
        },
        {
          name: "Payment History",
          icon: FileDown,
          href: `${basePath}/payments/history`,
        },
      ],
    },

    {
      name: "Partners",
      icon: Users,
      sub: [
        {
          name: "Partner Ledger",
          icon: NotebookPen,
          href: `${basePath}/partners/ledger`,
        },
        {
          name: "Partner Rates",
          icon: BarChart3,
          href: `${basePath}/partners/rates`,
        },
      ],
    },

    {
      name: "Reports",
      icon: BarChart3,
      sub: [
        {
          name: "Payment Reports",
          icon: FileDown,
          href: `${basePath}/reports/payments`,
        },
        {
          name: "Partner Ledger",
          icon: FileDown,
          href: `${basePath}/reports/partner-ledger`,
        },
      ],
    },

    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Profile",
          icon: Settings,
          href: `${basePath}/profile`,
        },
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ---------------- PARTNER OWNER MENU ---------------- */
  const partnerOwnerMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: `${basePath}`,
    },

    /* ---------------- SHIPMENTS ---------------- */
    {
      name: "Shipments",
      icon: Truck,
      sub: [
        {
          name: "All Shipments",
          icon: FileDown,
          href: `${basePath}/shipments`,
        },
        {
          name: "Create Shipment",
          icon: UserPlus,
          href: `${basePath}/shipments/create`,
        },
        {
          name: "All Rates",
          icon: UserPlus,
          href: `${basePath}/rates`,
        },
      ],
    },

    /* ---------------- PACKAGES ---------------- */
    {
      name: "Packages",
      icon: Package,
      sub: [
        {
          name: "Package Scan",
          icon: ScanLine,
          href: `${basePath}/package/scan`,
        },
        {
          name: "Scan History",
          icon: CalendarClock,
          href: `${basePath}/package/scan-history`,
        },
      ],
    },

    /* ---------------- MANIFESTS ---------------- */
    {
      name: "Manifests",
      icon: NotebookPen,
      sub: [
        {
          name: "All Manifests",
          icon: FileIcon,
          href: `${basePath}/manifests`,
        },
        {
          name: "Create Manifest",
          icon: UserPlus,
          href: `${basePath}/manifests/create`,
        },
        {
          name: "Manifest Packages",
          icon: FileDown,
          href: `${basePath}/manifests/packages`,
        },
      ],
    },

    /* ---------------- CUSTOMERS ---------------- */
    {
      name: "Customers",
      icon: Users,
      sub: [
        {
          name: "All Customers",
          icon: UserRoundSearch,
          href: `${basePath}/customers/allcustomers`,
        },
        {
          name: "Add Customer",
          icon: UserPlus,
          href: `${basePath}/customers/create`,
        },
      ],
    },

    /* ---------------- PAYMENTS ---------------- */
    {
      name: "Payments",
      icon: Wallet,
      sub: [
        {
          name: "All Payments",
          icon: BarChart3,
          href: `${basePath}/payments`,
        },
        {
          name: "All Ledger",
          icon: FileDown,
          href: `${basePath}/partners/ledger`,
        },
      ],
    },

    /* ---------------- REPORTS ---------------- */
    {
      name: "Reports",
      icon: BarChart3,
      sub: [
        {
          name: "Shipment Reports",
          icon: FileDown,
          href: `${basePath}/reports/shipments`,
        },
        {
          name: "Payment Reports",
          icon: FileDown,
          href: `${basePath}/reports/payments`,
        },
        {
          name: "Partner Ledger",
          icon: FileDown,
          href: `${basePath}/reports/partner-ledger`,
        },
      ],
    },

    /* ---------------- SETTINGS ---------------- */
    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Profile",
          icon: Settings,
          href: `${basePath}/profile`,
        },
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ---------------- PARTNER MANAGER MENU ---------------- */
  const partnerManagerMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: `${basePath}/manager`,
    },

    /* ---------------- SHIPMENTS ---------------- */
    {
      name: "Shipments",
      icon: Truck,
      sub: [
        {
          name: "All Shipments",
          icon: FileDown,
          href: `${basePath}/shipments`,
        },
        {
          name: "Create Shipment",
          icon: UserPlus,
          href: `${basePath}/shipments/create`,
        },
        {
          name: "Shipment Tracking",
          icon: UserRoundSearch,
          href: `${basePath}/shipments/tracking`,
        },
      ],
    },

    /* ---------------- PACKAGES ---------------- */
    {
      name: "Packages",
      icon: Package,
      sub: [
        {
          name: "All Packages",
          icon: FileIcon,
          href: `${basePath}/packages`,
        },
        {
          name: "Package Scan",
          icon: ScanLine,
          href: `${basePath}/packages/scan`,
        },
        {
          name: "Scan History",
          icon: CalendarClock,
          href: `${basePath}/packages/scan-history`,
        },
      ],
    },

    /* ---------------- MANIFESTS ---------------- */
    {
      name: "Manifests",
      icon: NotebookPen,
      sub: [
        {
          name: "All Manifests",
          icon: FileIcon,
          href: `${basePath}/manifests`,
        },
        {
          name: "Create Manifest",
          icon: UserPlus,
          href: `${basePath}/manifests/create`,
        },
        {
          name: "Manifest Packages",
          icon: FileDown,
          href: `${basePath}/manifests/packages`,
        },
      ],
    },

    /* ---------------- CUSTOMERS ---------------- */
    {
      name: "Customers",
      icon: Users,
      sub: [
        {
          name: "All Customers",
          icon: UserRoundSearch,
          href: `${basePath}/customers/allcustomers`,
        },
        {
          name: "Add Customer",
          icon: UserPlus,
          href: `${basePath}/customers/create`,
        },
      ],
    },

    /* ---------------- PAYMENTS ---------------- */
    {
      name: "Payments",
      icon: Wallet,
      sub: [
        {
          name: "All Payments",
          icon: BarChart3,
          href: `${basePath}/payments`,
        },
        {
          name: "Record Payment",
          icon: UserPlus,
          href: `${basePath}/payments/create`,
        },
        {
          name: "Payment History",
          icon: FileDown,
          href: `${basePath}/payments/history`,
        },
      ],
    },

    /* ---------------- USER (GILBRICE STAFF) ---------------- */
    {
      name: "User",
      icon: Users,
      sub: [
        {
          name: "All User",
          icon: UserRoundSearch,
          href: `${basePath}/user`,
        },
        {
          name: "Add User",
          icon: UserPlus,
          href: `${basePath}/user/create`,
        },
      ],
    },

    /* ---------------- REPORTS ---------------- */
    {
      name: "Reports",
      icon: BarChart3,
      sub: [
        {
          name: "Shipment Reports",
          icon: FileDown,
          href: `${basePath}/reports/shipments`,
        },
        {
          name: "Payment Reports",
          icon: FileDown,
          href: `${basePath}/reports/payments`,
        },
        {
          name: "Partner Ledger",
          icon: FileDown,
          href: `${basePath}/reports/partner-ledger`,
        },
      ],
    },

    /* ---------------- SETTINGS ---------------- */
    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Profile",
          icon: Settings,
          href: `${basePath}/profile`,
        },
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ---------------- WAREHOUSE EMPLOYEE MENU ---------------- */
  const warehouseEmployeeMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: `${basePath}/partner`,
    },

    {
      name: "Shipments",
      icon: Truck,
      sub: [
        {
          name: "All Shipments",
          icon: FileDown,
          href: `${basePath}/partner/shipments`,
        },
        {
          name: "Track Shipment",
          icon: UserRoundSearch,
          href: `${basePath}/partner/shipments/tracking`,
        },
      ],
    },

    {
      name: "Packages",
      icon: Package,
      sub: [
        {
          name: "All Packages",
          icon: FileIcon,
          href: `${basePath}/partner/packages`,
        },
        {
          name: "Scan Package",
          icon: ScanLine,
          href: `${basePath}/partner/packages/scan`,
        },
      ],
    },

    {
      name: "Profile",
      icon: Settings,
      href: `${basePath}/partner/profile`,
    },

    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ---------------- CASHIER MENU ---------------- */
  const cashierMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: `${basePath}/partner`,
    },

    {
      name: "Customers",
      icon: Users,
      sub: [
        {
          name: "All Customers",
          icon: UserRoundSearch,
          href: `${basePath}/partner/customers`,
        },
      ],
    },

    {
      name: "Payments",
      icon: Wallet,
      sub: [
        {
          name: "Payments",
          icon: BarChart3,
          href: `${basePath}/partner/payments`,
        },
        {
          name: "Record Payment",
          icon: UserPlus,
          href: `${basePath}/partner/payments/create`,
        },
        {
          name: "Payment History",
          icon: FileDown,
          href: `${basePath}/partner/payments/history`,
        },
      ],
    },

    {
      name: "Ledger",
      icon: NotebookPen,
      href: `${basePath}/partner/ledger`,
    },

    {
      name: "Profile",
      icon: Settings,
      href: `${basePath}/partner/profile`,
    },

    {
      name: "Settings",
      icon: Settings,
      sub: [
        {
          name: "Change Password",
          icon: KeySquareIcon,
          href: `${basePath}/password`,
        },
      ],
    },

    {
      name: "Logout",
      icon: LogOut,
      href: `${basePath}/logout`,
    },
  ];

  /* ============================================================
     FINAL ROLE → MENU CONFIG
  ============================================================ */
  return {
    GILBRICE_SUPER_ADMIN: gilbriceAdminMenu,

    GILBRICE_ADMIN: gilbriceAdminMenu,

    GILBRICE_FINANCE: gilbriceFinanceMenu,

    OWNER: partnerOwnerMenu,

    MANAGER: partnerManagerMenu,

    WAREHOUSE_EMPLOYEE: warehouseEmployeeMenu,

    CASHIER: cashierMenu,
  };
};
