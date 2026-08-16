"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-600">
          STAFF United
        </p>
        <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
          Client Portal
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Sign in to view your transaction history.
        </p>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-slate-900 p-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link
            href="/portal/forgot-password"
            className="block text-center text-xs text-slate-500 hover:text-emerald-600"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
