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
   GILBRICE ADMIN MENU
============================================================ */

const gilbriceAdminMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/admin",
  },

  /* ---------------- SHIPMENTS ---------------- */

  {
    name: "Shipments",
    icon: Truck,
    sub: [
      {
        name: "All Shipments",
        icon: FileDown,
        href: "/admin/shipments",
      },
      {
        name: "Create Shipment",
        icon: UserPlus,
        href: "/admin/shipments/create",
      },
      {
        name: "Shipment Tracking",
        icon: UserRoundSearch,
        href: "/admin/shipments/tracking",
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
        href: "/admin/packages",
      },
      {
        name: "Package Scan",
        icon: ScanLine,
        href: "/admin/packages/scan",
      },
      {
        name: "Scan History",
        icon: CalendarClock,
        href: "/admin/packages/scan-history",
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
        href: "/admin/manifests",
      },
      {
        name: "Create Manifest",
        icon: UserPlus,
        href: "/admin/manifests/create",
      },
      {
        name: "Manifest Packages",
        icon: FileDown,
        href: "/admin/manifests/packages",
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
        href: "/admin/customers",
      },
      {
        name: "Add Customer",
        icon: UserPlus,
        href: "/admin/customers/create",
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
        href: "/admin/partners",
      },
      {
        name: "Add Partner",
        icon: UserPlus,
        href: "/admin/partners/create",
      },
      {
        name: "Partner Rates",
        icon: BarChart3,
        href: "/admin/partners/rates",
      },
      {
        name: "Partner Ledger",
        icon: NotebookPen,
        href: "/admin/partners/ledger",
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
        href: "/admin/payments",
      },
      {
        name: "Record Payment",
        icon: UserPlus,
        href: "/admin/payments/create",
      },
      {
        name: "Payment History",
        icon: FileDown,
        href: "/admin/payments/history",
      },
    ],
  },

  /* ---------------- STAFF ---------------- */

  {
    name: "Staff",
    icon: Users,
    sub: [
      {
        name: "All Staff",
        icon: UserRoundSearch,
        href: "/admin/staff",
      },
      {
        name: "Add Staff",
        icon: UserPlus,
        href: "/admin/staff/create",
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
        href: "/admin/reports/shipments",
      },
      {
        name: "Payment Reports",
        icon: FileDown,
        href: "/admin/reports/payments",
      },
      {
        name: "Partner Ledger",
        icon: FileDown,
        href: "/admin/reports/partner-ledger",
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
        href: "/admin/profile",
      },
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   GILBRICE FINANCE MENU
============================================================ */

const gilbriceFinanceMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/admin",
  },

  {
    name: "Payments",
    icon: Wallet,
    sub: [
      {
        name: "All Payments",
        icon: BarChart3,
        href: "/admin/payments",
      },
      {
        name: "Record Payment",
        icon: UserPlus,
        href: "/admin/payments/create",
      },
      {
        name: "Payment History",
        icon: FileDown,
        href: "/admin/payments/history",
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
        href: "/admin/partners/ledger",
      },
      {
        name: "Partner Rates",
        icon: BarChart3,
        href: "/admin/partners/rates",
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
        href: "/admin/reports/payments",
      },
      {
        name: "Partner Ledger",
        icon: FileDown,
        href: "/admin/reports/partner-ledger",
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
        href: "/admin/profile",
      },
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   PARTNER OWNER MENU
============================================================ */

const partnerOwnerMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/partner",
  },

  {
    name: "Shipments",
    icon: Truck,
    sub: [
      {
        name: "All Shipments",
        icon: FileDown,
        href: "/partner/shipments",
      },
      {
        name: "Create Shipment",
        icon: UserPlus,
        href: "/partner/shipments/create",
      },
      {
        name: "Track Shipment",
        icon: UserRoundSearch,
        href: "/partner/shipments/tracking",
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
        href: "/partner/packages",
      },
      {
        name: "Scan Package",
        icon: ScanLine,
        href: "/partner/packages/scan",
      },
    ],
  },

  {
    name: "Customers",
    icon: Users,
    sub: [
      {
        name: "All Customers",
        icon: UserRoundSearch,
        href: "/partner/customers",
      },
      {
        name: "Add Customer",
        icon: UserPlus,
        href: "/partner/customers/create",
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
        href: "/partner/payments",
      },
      {
        name: "Record Payment",
        icon: UserPlus,
        href: "/partner/payments/create",
      },
      {
        name: "Payment History",
        icon: FileDown,
        href: "/partner/payments/history",
      },
    ],
  },

  {
    name: "Ledger",
    icon: NotebookPen,
    href: "/partner/ledger",
  },

  {
    name: "Staff",
    icon: Users,
    sub: [
      {
        name: "All Staff",
        icon: UserRoundSearch,
        href: "/partner/staff",
      },
      {
        name: "Add Staff",
        icon: UserPlus,
        href: "/partner/staff/create",
      },
    ],
  },

  {
    name: "Profile",
    icon: Settings,
    href: "/partner/profile",
  },

  {
    name: "Settings",
    icon: Settings,
    sub: [
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   PARTNER MANAGER MENU
============================================================ */

const partnerManagerMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/partner",
  },

  {
    name: "Shipments",
    icon: Truck,
    sub: [
      {
        name: "All Shipments",
        icon: FileDown,
        href: "/partner/shipments",
      },
      {
        name: "Create Shipment",
        icon: UserPlus,
        href: "/partner/shipments/create",
      },
      {
        name: "Track Shipment",
        icon: UserRoundSearch,
        href: "/partner/shipments/tracking",
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
        href: "/partner/packages",
      },
      {
        name: "Scan Package",
        icon: ScanLine,
        href: "/partner/packages/scan",
      },
    ],
  },

  {
    name: "Customers",
    icon: Users,
    sub: [
      {
        name: "All Customers",
        icon: UserRoundSearch,
        href: "/partner/customers",
      },
      {
        name: "Add Customer",
        icon: UserPlus,
        href: "/partner/customers/create",
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
        href: "/partner/payments",
      },
      {
        name: "Payment History",
        icon: FileDown,
        href: "/partner/payments/history",
      },
    ],
  },

  {
    name: "Ledger",
    icon: NotebookPen,
    href: "/partner/ledger",
  },

  {
    name: "Profile",
    icon: Settings,
    href: "/partner/profile",
  },

  {
    name: "Settings",
    icon: Settings,
    sub: [
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   WAREHOUSE EMPLOYEE MENU
============================================================ */

const warehouseEmployeeMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/partner",
  },

  {
    name: "Shipments",
    icon: Truck,
    sub: [
      {
        name: "All Shipments",
        icon: FileDown,
        href: "/partner/shipments",
      },
      {
        name: "Track Shipment",
        icon: UserRoundSearch,
        href: "/partner/shipments/tracking",
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
        href: "/partner/packages",
      },
      {
        name: "Scan Package",
        icon: ScanLine,
        href: "/partner/packages/scan",
      },
    ],
  },

  {
    name: "Profile",
    icon: Settings,
    href: "/partner/profile",
  },

  {
    name: "Settings",
    icon: Settings,
    sub: [
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   CASHIER MENU
============================================================ */

const cashierMenu: MenuItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/partner",
  },

  {
    name: "Customers",
    icon: Users,
    sub: [
      {
        name: "All Customers",
        icon: UserRoundSearch,
        href: "/partner/customers",
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
        href: "/partner/payments",
      },
      {
        name: "Record Payment",
        icon: UserPlus,
        href: "/partner/payments/create",
      },
      {
        name: "Payment History",
        icon: FileDown,
        href: "/partner/payments/history",
      },
    ],
  },

  {
    name: "Ledger",
    icon: NotebookPen,
    href: "/partner/ledger",
  },

  {
    name: "Profile",
    icon: Settings,
    href: "/partner/profile",
  },

  {
    name: "Settings",
    icon: Settings,
    sub: [
      {
        name: "Change Password",
        icon: KeySquareIcon,
        href: "/password",
      },
    ],
  },

  {
    name: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

/* ============================================================
   FINAL ROLE → MENU CONFIG
============================================================ */

export const menus: Record<UserRole, MenuItem[]> = {
  GILBRICE_SUPER_ADMIN: gilbriceAdminMenu,

  GILBRICE_ADMIN: gilbriceAdminMenu,

  GILBRICE_FINANCE: gilbriceFinanceMenu,

  OWNER: partnerOwnerMenu,

  MANAGER: partnerManagerMenu,

  WAREHOUSE_EMPLOYEE: warehouseEmployeeMenu,

  CASHIER: cashierMenu,
};
