"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markQuoteAsPaid } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface MarkPaidCardProps {
  quoteId: string;
  proposalStatus: string;
  onMarked: () => void;
}

// Chỉ hiện khi quote đã ở trạng thái "accepted" — nhân viên bấm SAU KHI
// đã xác nhận thấy tiền về tài khoản (chuyển khoản thủ công, không có
// cổng thanh toán tự động xác nhận). Bấm xong mới tính là "Won".
export function MarkPaidCard({
  quoteId,
  proposalStatus,
  onMarked,
}: MarkPaidCardProps) {
  const [saving, setSaving] = useState(false);

  if (proposalStatus === "paid") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-700">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">
          Payment confirmed — this deal is marked as Won.
        </span>
      </div>
    );
  }

  if (proposalStatus !== "accepted") {
    return null; // Chưa accept thì chưa có gì để đánh dấu paid
  }

  async function handleMarkPaid() {
    setSaving(true);
    try {
      await markQuoteAsPaid(quoteId);
      toast.success("Marked as paid. Lead status updated to Won.");

      // Gửi email xác nhận thanh toán cho khách — không chặn luồng
      // chính nếu gửi thất bại (VD: khách chưa để lại email nào).
      try {
        const res = await fetch("/api/proposal/payment-confirmed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Confirmation email sent to client.");
        } else if (data.reason === "no_email") {
          toast.warning(
            "No client email on file — confirmation email not sent.",
          );
        }
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }

      onMarked();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as paid.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm text-amber-800">
        Client has accepted this proposal but payment has not been confirmed
        yet. Once you&apos;ve verified the bank transfer has been received, mark
        it as paid below.
      </p>
      <Button
        onClick={handleMarkPaid}
        disabled={saving}
        className="w-full bg-amber-600 hover:bg-amber-700 cursor-pointer"
      >
        {saving ? "Confirming..." : "✓ Confirm Payment Received"}
      </Button>
    </div>
  );
}
