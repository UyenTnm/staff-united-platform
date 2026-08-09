"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { requestPasswordReset } from "@/lib/auth/password-reset";

const BRAND = {
  navyDarkest: "#0a1b33",
  blueAccent: "#4f8dc9",
  navy: "#103663",
  slateBlue: "#4a596e",
  lightGray: "#d5dadf",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      toast.warning("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      console.error(err);
      // Không tiết lộ email có tồn tại hay không (bảo mật) — luôn hiện
      // thông báo thành công như nhau dù email đúng hay sai.
      setSent(true);
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
      {/* Khối gradient trôi nổi — đồng bộ với trang login */}
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
          {/* Dải màu brand ở đầu card — đồng bộ với login */}
          <div
            style={{
              background: `linear-gradient(90deg, ${BRAND.navyDarkest}, ${BRAND.navy}, ${BRAND.blueAccent})`,
            }}
            className="h-1.5 w-full"
          />

          <div className="p-8">
            <Link
              href="/login"
              style={{ color: BRAND.slateBlue }}
              className="inline-flex items-center gap-1.5 text-sm hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            {!sent ? (
              <>
                <h1
                  style={{ color: BRAND.navyDarkest }}
                  className="mt-6 text-2xl font-bold"
                >
                  Forgot password?
                </h1>
                <p style={{ color: BRAND.slateBlue }} className="mt-2">
                  Enter your email and we&apos;ll send you a link to reset your
                  password.
                </p>

                <div className="mt-6 space-y-4">
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
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      style={{ borderColor: BRAND.lightGray }}
                      className="w-full rounded-lg border p-3 pl-10 outline-none transition"
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

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.blueAccent})`,
                    }}
                    className="w-full rounded-lg p-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-6 text-center">
                <CheckCircle2
                  style={{ color: BRAND.blueAccent }}
                  className="mx-auto h-12 w-12"
                />
                <h1
                  style={{ color: BRAND.navyDarkest }}
                  className="mt-4 text-xl font-bold"
                >
                  Check your email
                </h1>
                <p style={{ color: BRAND.slateBlue }} className="mt-2">
                  If an account exists for <strong>{email}</strong>, a password
                  reset link has been sent. Check your inbox (and spam folder).
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#4a596e" }}>
          © {new Date().getFullYear()} STAFF United. All rights reserved.
        </p>
      </div>
    </div>
  );
}
