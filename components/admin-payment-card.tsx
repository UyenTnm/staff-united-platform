"use client";

import { useState } from "react";
import { CheckCircle2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  confirmDepositReceived,
  unlockFinalPayment,
  markQuoteAsPaid,
} from "@/lib/crm/quotes";
import { toast } from "sonner";

interface AdminPaymentCardProps {
  quoteId: string;
  proposalStatus: string;
  paymentType: "full" | "deposit";
  finalPaymentUnlocked: boolean;
  onChanged: () => void;
}

// Nút điều khiển thanh toán cho Sale — TỰ ĐỘNG hiện đúng nút theo
// đúng giai đoạn, tùy payment_type (full hay deposit 50/50):
//   full:     "Confirm Payment Received" → Paid
//   deposit:  "Confirm Deposit Received" → deposit_paid
//          → "Unlock Final Payment" → final_payment_unlocked = true
//          → "Confirm Final Payment Received" → Paid
export function AdminPaymentCard({
  quoteId,
  proposalStatus,
  paymentType,
  finalPaymentUnlocked,
  onChanged,
}: AdminPaymentCardProps) {
  const [saving, setSaving] = useState(false);

  async function notifyClient(stage: "deposit" | "final" | "full") {
    try {
      const res = await fetch("/api/proposal/payment-confirmed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, stage }),
      });
      const data = await res.json();

      // Báo rõ cho sale nếu email KHÔNG gửi được, thay vì im lặng —
      // để dễ chẩn đoán (VD: quote chưa có billing_email/contact_email).
      if (!res.ok) {
        toast.warning("Payment confirmed, but email failed to send.");
      } else if (data.reason === "no_email") {
        toast.warning(
          "Payment confirmed, but no client email on file — email not sent.",
        );
      } else if (data.success) {
        toast.success("Confirmation email sent to client.");
      }
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
      toast.warning("Payment confirmed, but email failed to send.");
    }
  }

  if (proposalStatus === "paid") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-700">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">
          {paymentType === "deposit"
            ? "Fully paid — both deposit and final payment received."
            : "Payment confirmed — this deal is marked as Won."}
        </span>
      </div>
    );
  }

  // ===== payment_type = "full" =====
  if (paymentType === "full") {
    if (proposalStatus !== "accepted") return null;

    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 text-sm text-amber-800">
          Client has accepted this proposal but payment has not been confirmed
          yet.
        </p>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await markQuoteAsPaid(quoteId);
              await notifyClient("full");
              toast.success("Marked as paid. Lead status updated to Won.");
              onChanged();
            } catch (err) {
              console.error(err);
              toast.error("Failed to mark as paid.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="w-full cursor-pointer bg-amber-600 hover:bg-amber-700"
        >
          {saving ? "Confirming..." : "✓ Confirm Payment Received"}
        </Button>
      </div>
    );
  }

  // ===== payment_type = "deposit" — Giai đoạn 1: chờ Deposit =====
  if (proposalStatus === "accepted") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 text-sm text-amber-800">
          Client has accepted this proposal. Waiting for the 50% deposit
          payment.
        </p>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await confirmDepositReceived(quoteId);
              await notifyClient("deposit");
              toast.success(
                "Deposit confirmed. Lead status updated to In Progress.",
              );
              onChanged();
            } catch (err) {
              console.error(err);
              toast.error("Failed to confirm deposit.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="w-full cursor-pointer bg-amber-600 hover:bg-amber-700"
        >
          {saving ? "Confirming..." : "✓ Confirm Deposit Received (50%)"}
        </Button>
      </div>
    );
  }

  // ===== Giai đoạn 2: đã nhận Deposit, đang triển khai =====
  if (proposalStatus === "deposit_paid" && !finalPaymentUnlocked) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Deposit received — project in progress.
        </div>
        <p className="mb-3 text-sm text-blue-700">
          Once the work is delivered, unlock the final payment so the client can
          pay the remaining 50%.
        </p>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await unlockFinalPayment(quoteId);
              toast.success("Final payment unlocked for client.");
              onChanged();
            } catch (err) {
              console.error(err);
              toast.error("Failed to unlock final payment.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          variant="outline"
          className="w-full cursor-pointer"
        >
          <Unlock className="mr-1.5 h-4 w-4" />
          {saving ? "Unlocking..." : "Unlock Final Payment"}
        </Button>
      </div>
    );
  }

  // ===== Giai đoạn 3: đã unlock, chờ Final Payment =====
  if (proposalStatus === "deposit_paid" && finalPaymentUnlocked) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 text-sm text-amber-800">
          Final payment has been unlocked for the client. Waiting for the
          remaining 50%.
        </p>
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await markQuoteAsPaid(quoteId);
              await notifyClient("final");
              toast.success("Final payment confirmed. Deal marked as Won.");
              onChanged();
            } catch (err) {
              console.error(err);
              toast.error("Failed to confirm final payment.");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="w-full cursor-pointer bg-amber-600 hover:bg-amber-700"
        >
          {saving ? "Confirming..." : "✓ Confirm Final Payment Received (50%)"}
        </Button>
      </div>
    );
  }

  return null;
}
