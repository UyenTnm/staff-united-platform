"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PortalAuthLayout } from "@/components/portal-auth-layout";
import { PasswordInput } from "@/components/portal-password-input";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          setChecking(false);
        }
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setChecking(false);
      }
    });

    const timeout = setTimeout(() => {
      setChecking((prev) => {
        if (prev) setLinkInvalid(true);
        return false;
      });
    }, 5000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSetPassword() {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/portal");
    } catch (err) {
      console.error(err);
      setError("Failed to set password. Please try the invite link again.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <PortalAuthLayout>
        <p className="text-sm text-slate-300">Verifying your link...</p>
      </PortalAuthLayout>
    );
  }

  if (linkInvalid) {
    return (
      <PortalAuthLayout>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">
            Link expired or invalid
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Please contact us to request a new invite link.
          </p>
        </div>
      </PortalAuthLayout>
    );
  }

  return (
    <PortalAuthLayout>
      <h1 className="text-2xl font-bold text-white">
        Welcome! Set your password
      </h1>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm">
        <span className="text-slate-300">Setting password for </span>
        <span className="font-semibold text-white">{userEmail}</span>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            New password
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Confirm password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleSetPassword}
          disabled={saving}
          className="w-full cursor-pointer rounded-xl bg-emerald-500 p-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Set password & continue"}
        </button>
      </div>
    </PortalAuthLayout>
  );
}
