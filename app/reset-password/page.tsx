"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { updatePassword } from "@/lib/auth/password-reset";

const BRAND = {
  navyDarkest: "#0a1b33",
  blueAccent: "#4f8dc9",
  navy: "#103663",
  slateBlue: "#4a596e",
  lightGray: "#d5dadf",
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated. Please sign in again.");
      router.replace("/login");
    } catch (err) {
      console.error(err);
      toast.error(
        "Could not update password. The reset link may have expired — please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #d5dadf 0%, #ffffff 50%, #d5dadf 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-slow absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "rgba(79, 141, 201, 0.25)" }}
        />
        <div
          className="animate-float-slower absolute -right-24 top-1/3 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(16, 54, 99, 0.2)" }}
        />
        <div
          className="animate-float-slow absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(10, 27, 51, 0.15)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div
            style={{
              background: `linear-gradient(90deg, ${BRAND.navyDarkest}, ${BRAND.navy}, ${BRAND.blueAccent})`,
            }}
            className="h-1.5 w-full"
          />

          <div className="p-8">
            <h1
              style={{ color: BRAND.navyDarkest }}
              className="text-2xl font-bold"
            >
              Set a new password
            </h1>
            <p style={{ color: BRAND.slateBlue }} className="mt-2">
              Choose a new password for your account.
            </p>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderColor: BRAND.lightGray }}
                  className="w-full rounded-lg border p-3 pr-12 outline-none transition"
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

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ borderColor: BRAND.lightGray }}
                className="w-full rounded-lg border p-3 outline-none transition"
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
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.blueAccent})`,
                }}
                className="w-full rounded-lg p-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#4a596e" }}>
          © {new Date().getFullYear()} STAFF United. All rights reserved.
        </p>
      </div>
    </div>
  );
}
