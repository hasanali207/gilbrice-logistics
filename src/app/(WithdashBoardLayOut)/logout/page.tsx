"use client";

import { logout } from "@/Redux/Features/Auth/authSlice";
import { useAppDispatch } from "@/Redux/hook";
import { persistor } from "@/Redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        dispatch(logout());
        await persistor.purge();
      } finally {
        router.replace("/");
        window.location.href = "/";
      }
    };

    handleLogout();
  }, []);

  return <div className="p-10 text-center text-lg">Logging out...</div>;
}
