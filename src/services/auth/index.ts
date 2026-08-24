"use server";

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
// ✅ Register User
export const registerUser = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${BASE_API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await res.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong.",
    };
  }
};
export const loginUser = async (userData: FieldValues) => {
  try {
    if (!BASE_API) {
      throw new Error("NEXT_PUBLIC_BASE_API is missing");
    }

    const response = await fetch(`${BASE_API}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userType: userData.userType,
        email: userData.email,
        password: userData.password,
      }),
      cache: "no-store",
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        `Backend returned invalid JSON. Status: ${response.status}`,
      );
    }

    if (!response.ok) {
      return {
        success: false,
        message: result?.message || `Backend error: ${response.status}`,
      };
    }

    if (!result.success) {
      return result;
    }

    // ==========================================
    // ACCESS TOKEN COOKIE
    // ==========================================

    const cookieStore = await cookies();

    cookieStore.set("accessToken", result.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // ==========================================
    // REFRESH TOKEN COOKIE
    // ==========================================

    if (result.data.refreshToken) {
      cookieStore.set("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Backend connection failed",
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return null;
    }

    const decoded = jwtDecode(accessToken);

    return decoded;
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return null;
  }
};

export const logout = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};
