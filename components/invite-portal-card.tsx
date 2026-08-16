"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvitePortalCardProps {
  proposalStatus: string;
  clientEmail: string | null;
}

// Chỉ hiện khi quote đã Paid — sale bấm mời khách vào Client Portal
// để họ tự xem lịch sử giao dịch, các proposal đã dùng.
export function InvitePortalCard({
  proposalStatus,
  clientEmail,
}: InvitePortalCardProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (proposalStatus !== "paid") return null;

  if (!clientEmail) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Add a client email (Billing Info or Client Information) before inviting
        them to the Client Portal.
      </div>
    );
  }

  async function handleInvite() {
    setSending(true);
    try {
      const res = await fetch("/api/portal/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientEmail }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success(
        data.alreadyInvited
          ? "Client already has portal access."
          : `Invite sent to ${clientEmail}`,
      );
      setSent(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invite.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        Portal invite sent to {clientEmail}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <UserPlus className="h-4 w-4 flex-shrink-0" />
        Give the client access to view their transaction history at{" "}
        <strong>{clientEmail}</strong>
      </div>
      <Button
        onClick={handleInvite}
        disabled={sending}
        size="sm"
        variant="outline"
        className="cursor-pointer flex-shrink-0"
      >
        {sending ? "Sending..." : "Invite to Client Portal"}
      </Button>
    </div>
  );
}
