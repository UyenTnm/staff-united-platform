"use client";

import { signIn } from "@/lib/auth";
import { loadCurrentEmployee } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useAuth } from "./auth-provider";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { refreshEmployee } = useAuth();

  async function handleLogin() {
    try {
      setLoading(true);

      await signIn(email, password);
      await refreshEmployee();

      const current = await loadCurrentEmployee();

      if (!current) {
        alert("Unable to load employee.");
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

      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">STAFF United</h1>

      <p className="mt-2 text-slate-500">Sign in to Staff Hub</p>

      <div className="mt-8 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 p-3 text-white disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </div>
    </div>
  );
}
