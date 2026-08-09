"use client";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #d5dadf 0%, #ffffff 50%, #d5dadf 100%)",
      }}
    >
      {/* Khối gradient trôi nổi dùng đúng bảng màu brand */}
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
        <LoginForm />

        <p className="mt-6 text-center text-xs" style={{ color: "#4a596e" }}>
          © {new Date().getFullYear()} STAFF United. All rights reserved.
        </p>
      </div>
    </div>
  );
}
