"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PortalAuthLayout } from "@/components/portal-auth-layout";

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
    <PortalAuthLayout>
      <h2 className="text-2xl font-bold text-white">Reset your password</h2>
      <p className="mt-1 text-sm text-slate-300">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-center text-sm text-brand-200">
          Check your inbox — a reset link has been sent to{" "}
          <strong>{email}</strong>.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/20 bg-white/10 p-3.5 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition focus:border-brand-400/60 focus:ring-1 focus:ring-brand-400/60"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={handleReset}
            disabled={sending}
            className="w-full cursor-pointer rounded-xl bg-brand-500 p-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send reset link"}
          </button>
        </div>
      )}
    </PortalAuthLayout>
  );
}
