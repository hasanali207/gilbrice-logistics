import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

const authRoutes = ["/login", "/register"];

const roleBasedPrivateRoutes: Record<string, RegExp[]> = {
  gilbrice_super_admin: [/^\/superadmin(?:\/|$)/],
  gilbrice_admin: [/^\/admin(?:\/|$)/],
  gilbrice_finance: [/^\/finance(?:\/|$)/],
  owner: [/^\/owner(?:\/|$)/],
  manager: [/^\/manager(?:\/|$)/],
  warehouse_employee: [/^\/warehouse(?:\/|$)/],
  cashier: [/^\/cashier(?:\/|$)/],
};

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    if (authRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(`/login?redirectPath=${pathname}`, request.url),
    );
  }

  try {
    const decoded: any = jwtDecode(token);

    const role = String(decoded.role || "").toLowerCase();

    const allowedRoutes = roleBasedPrivateRoutes[role];

    if (!allowedRoutes) {
      console.log("UNKNOWN ROLE:", decoded.role);

      return NextResponse.redirect(new URL("/login", request.url));
    }

    const allowed = allowedRoutes.some((route) => route.test(pathname));

    if (allowed) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("JWT ERROR:", error);

    return NextResponse.redirect(
      new URL(`/login?redirectPath=${pathname}`, request.url),
    );
  }
};

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/finance/:path*",
    "/owner/:path*",
    "/manager/:path*",
    "/warehouse/:path*",
    "/cashier/:path*",
  ],
};
