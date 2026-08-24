export const getDashboardPath = (role?: string | null) => {
  switch (role) {
    // ============================================
    // GILBRICE STAFF
    // ============================================

    case "GILBRICE_SUPER_ADMIN":
      return "/superadmin";

    case "GILBRICE_ADMIN":
      return "/admin";

    case "GILBRICE_FINANCE":
      return "/finance";

    // ============================================
    // PARTNER EMPLOYEES
    // ============================================

    case "OWNER":
      return "/owner";

    case "MANAGER":
      return "/manager";

    case "WAREHOUSE_EMPLOYEE":
      return "/warehouse";

    case "CASHIER":
      return "/cashier";

    // ============================================
    // UNKNOWN ROLE
    // ============================================

    default:
      return "/login";
  }
};
