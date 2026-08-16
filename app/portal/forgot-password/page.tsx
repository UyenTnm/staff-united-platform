"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PortalForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (!email.trim()) return;

    setSending(true);
    setError("");
    try {
      const baseUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${baseUrl}/portal/set-password` },
      );
      if (error) throw error;
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-600">
          STAFF United
        </p>
        <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
          Reset your password
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-center text-sm text-emerald-700">
            Check your inbox — a reset link has been sent to{" "}
            <strong>{email}</strong>.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-200 p-3 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={handleReset}
              disabled={sending}
              className="w-full cursor-pointer rounded-lg bg-slate-900 p-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              {sending ? "Sending..." : "Send reset link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
