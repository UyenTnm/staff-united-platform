"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Ô nhập mật khẩu dùng chung cho mọi trang Portal (Login, Forgot
// Password, Set Password) — có icon con mắt để hiện/ẩn mật khẩu,
// style theo phong cách glassmorphism (nền trong mờ, chữ trắng).
export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  onKeyDown,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/20 bg-white/10 p-3.5 pr-11 text-sm text-white placeholder-white/40 outline-none backdrop-blur-md transition focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/60"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-white/50 hover:text-white/80"
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}