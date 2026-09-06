"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PortalAuthLayout } from "@/components/portal-auth-layout";
import { PasswordInput } from "@/components/portal-password-input";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) return;

    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      router.push("/portal");
    } catch (err) {
      console.error(err);
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalAuthLayout>
      <h2 className="text-2xl font-bold text-white">Sign in</h2>
      <p className="mt-1 text-sm text-slate-300">
        Enter your details to access your portal.
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-white/20 bg-white/10 p-3.5 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition focus:border-brand-400/60 focus:ring-1 focus:ring-brand-400/60"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Password
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-brand-500 p-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Link
          href="/portal/forgot-password"
          className="block text-center text-xs font-medium text-slate-300 hover:text-brand-400"
        >
          Forgot password?
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        Need help? Contact your STAFF United account manager.
      </p>
    </PortalAuthLayout>
  );
}
