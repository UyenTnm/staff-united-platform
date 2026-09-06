"use client";

import { useRef, useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResendProposalLinkProps {
  token: string;
}

// Nút cho khách tự nhập email, gửi lại link proposal — phòng trường
// hợp khách làm mất link/xoá email cũ. Không cần đăng nhập.
export function ResendProposalLink({ token }: ResendProposalLinkProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  // Chặn gửi trùng — kiểm tra đồng bộ ngay lập tức (không đợi React
  // cập nhật state), tránh trường hợp bấm nhanh 2 lần gửi 2 email.
  const sendingRef = useRef(false);

  async function handleSend() {
    if (sendingRef.current) return; // Đang gửi rồi, bỏ qua lần bấm thêm

    if (!email.trim()) {
      toast.warning("Please enter your email.");
      return;
    }

    sendingRef.current = true;
    setSending(true);

    try {
      const res = await fetch("/api/proposal/resend-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: email.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      toast.success(`Link sent to ${email.trim()}!`);
      setSent(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not send email. Please try again.");
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        Link sent to your email — check your inbox.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mx-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
      >
        <Mail className="h-4 w-4" />
        Email me this link
      </button>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Mail className="h-4 w-4 text-brand-600" />
        Get this link by email
      </p>
      <p className="text-xs text-slate-500">
        So you can find this proposal again anytime.
      </p>
      <div className="mt-1 flex gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-lg border border-slate-200 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending}
          className="cursor-pointer"
        >
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
