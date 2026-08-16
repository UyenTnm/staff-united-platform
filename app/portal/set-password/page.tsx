"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Trạng thái chờ Supabase xử lý token từ URL và tạo session — bấm
  // "Set password" quá sớm (trước khi session sẵn sàng) sẽ báo lỗi
  // "Auth session missing!".
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    // Lắng nghe sự kiện session được thiết lập từ link mời/reset
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          setChecking(false);
        }
      },
    );

    // Đồng thời kiểm tra ngay — phòng trường hợp session đã có sẵn
    // trước khi listener kịp gắn.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setChecking(false);
      }
    });

    // Nếu sau 5 giây vẫn chưa có session — link đã hết hạn/không hợp lệ
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Verifying your link...</p>
      </div>
    );
  }

  if (linkInvalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">
            Link expired or invalid
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please contact us to request a new invite link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-600">
          STAFF United
        </p>
        <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
          Welcome! Set your password
        </h1>

        {/* Hiện rõ email đang đặt mật khẩu — tránh khách bối rối
            không biết tài khoản nào */}
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-center text-sm">
          <span className="text-slate-500">Setting password for </span>
          <span className="font-semibold text-slate-900">{userEmail}</span>
        </div>

        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleSetPassword}
            disabled={saving}
            className="w-full cursor-pointer rounded-lg bg-slate-900 p-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            {saving ? "Saving..." : "Set password & continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
