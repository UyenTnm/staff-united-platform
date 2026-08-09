"use client";

import { signIn } from "@/lib/auth";
import { loadCurrentEmployee } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const REMEMBER_EMAIL_KEY = "staff_platform_remembered_email";

// Bảng màu brand chính thức của STAFF United
const BRAND = {
  navyDarkest: "#0a1b33",
  blueAccent: "#4f8dc9",
  navy: "#103663",
  slateBlue: "#4a596e",
  lightGray: "#d5dadf",
};

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const { refreshEmployee } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      toast.warning("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signIn(email, password);
      await refreshEmployee();

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const current = await loadCurrentEmployee();

      if (!current) {
        toast.warning("Unable to load employee.");
        return;
      }
      if (current.account_status === "Password Change Required") {
        router.replace("/change-password");
        return;
      }

      switch (current.user_role) {
        case "Admin":
          router.replace("/dashboard");
          break;

        case "Employee":
          router.replace("/performance");
          break;

        case "HR":
          router.replace("/employees");
          break;

        case "Manager":
          router.replace("/reviews/pending");
          break;

        default:
          router.replace("/403");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
      {/* Dải màu brand ở đầu card */}
      <div
        style={{
          background: `linear-gradient(90deg, ${BRAND.navyDarkest}, ${BRAND.navy}, ${BRAND.blueAccent})`,
        }}
        className="h-1.5 w-full"
      />

      <div className="p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="STAFF United"
            width={140}
            height={56}
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
            priority
          />
          <h1
            style={{ color: BRAND.navyDarkest }}
            className="mt-4 text-2xl font-bold"
          >
            Welcome back
          </h1>
          <p style={{ color: BRAND.slateBlue }} className="mt-1">
            Sign in to Staff Hub
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <Mail
              style={{ color: BRAND.slateBlue }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderColor: BRAND.lightGray }}
              className="w-full rounded-lg border p-3 pl-10 outline-none transition focus:ring-1"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = BRAND.blueAccent;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${BRAND.blueAccent}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = BRAND.lightGray;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="relative">
            <Lock
              style={{ color: BRAND.slateBlue }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ borderColor: BRAND.lightGray }}
              className="w-full rounded-lg border p-3 pl-10 pr-12 outline-none transition"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = BRAND.blueAccent;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${BRAND.blueAccent}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = BRAND.lightGray;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ color: BRAND.slateBlue }}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label
              style={{ color: BRAND.slateBlue }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: BRAND.blueAccent }}
                className="h-4 w-4 rounded"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              style={{ color: BRAND.navy }}
              className="font-medium hover:opacity-70"
            >
              Forgot password?
            </Link>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.blueAccent})`,
            }}
            className="w-full rounded-lg p-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
