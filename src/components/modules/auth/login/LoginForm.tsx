"use client";

import { setUser } from "@/Redux/Features/Auth/authSlice";
import { useAppDispatch } from "@/Redux/hook";
import { loginUser } from "@/services/auth"; // ✅ server action, cookie সেট করে
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

type UserType = "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirectPath");
  const [formData, setFormData] = useState({
    userType: "GILBRICE_STAFF" as UserType,
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // INPUT CHANGE
  // ============================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // LOGIN
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await loginUser(formData);

      if (!res?.success) {
        toast.error(res?.message || "Login Information is incorrect");
        return;
      }

      // ============================================
      // BACKEND USER
      // ============================================

      const user = res?.data?.user;

      if (!user) {
        console.error("User missing from login response:", res);
        throw new Error("User information not found");
      }

      // ============================================
      // REDUX USER
      // ============================================

      const importantUserData = {
        id: user.id,
        username: user.email,
        name: user.fullName,
        email: user.email,
        role: user.role,
        userType: user.userType,
        partnerId: user.partnerId ?? null,
      };

      dispatch(
        setUser({
          user: importantUserData,
          token: res.data.accessToken,
        }),
      );

      if (redirect) {
        router.replace(redirect);
        return;
      }

      switch (user.role) {
        case "GILBRICE_SUPER_ADMIN":
          router.replace("/superadmin");
          break;

        case "GILBRICE_ADMIN":
          router.replace("/admin");
          break;

        case "GILBRICE_FINANCE":
          router.replace("/finance");
          break;

        case "OWNER":
          router.replace("/owner");
          break;
        case "MANAGER":
          router.replace("/manager");
          break;

        case "WAREHOUSE_EMPLOYEE":
          router.replace("/warehouse");
          break;

        case "DELIVERY_EMPLOYEE":
          router.replace("/delivery");
          break;

        default:
          router.replace("/");
          break;
      }
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      toast.error(error?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Gilbrice Logistics</h1>

        <p className="text-sm text-gray-500 mt-1">Login to your account</p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Login As
            </label>

            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="GILBRICE_STAFF">Gilbrice Staff</option>

              <option value="PARTNER_EMPLOYEE">Partner Employee</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AiFillEyeInvisible size={22} />
                ) : (
                  <AiFillEye size={22} />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup */}
        <div className="text-center mt-6 pt-5 border-t">
          <p className="text-sm text-gray-500">Don't have an account?</p>

          <Link
            href="/signup"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign Up
            <MoveRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
