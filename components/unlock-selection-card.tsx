"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  unlockSelectionForClient,
  lockSelectionFromClient,
} from "@/lib/crm/quotes";
import { toast } from "sonner";

interface UnlockSelectionCardProps {
  quoteId: string;
  proposalStatus: string;
  selectionUnlocked: boolean;
  onChanged?: () => void;
}

// Chỉ hiện khi quote đã Accepted (chưa Paid) — sale chủ động mở khóa
// tạm thời để khách tự sửa lại lựa chọn dịch vụ, ví dụ khi khách gọi
// điện báo lỡ chọn dư/thiếu/sai.
export function UnlockSelectionCard({
  quoteId,
  proposalStatus,
  selectionUnlocked,
  onChanged,
}: UnlockSelectionCardProps) {
  const [saving, setSaving] = useState(false);

  if (proposalStatus !== "accepted") return null; // Chưa accept hoặc đã Paid

  async function handleUnlock() {
    setSaving(true);
    try {
      await unlockSelectionForClient(quoteId);
      toast.success("Client can now edit their selection.");
      onChanged?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to unlock.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLock() {
    setSaving(true);
    try {
      await lockSelectionFromClient(quoteId);
      toast.success("Selection locked again.");
      onChanged?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to lock.");
    } finally {
      setSaving(false);
    }
  }

  if (selectionUnlocked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <Unlock className="h-4 w-4 flex-shrink-0" />
          Client can currently edit their service selection.
        </div>
        <Button
          onClick={handleLock}
          disabled={saving}
          size="sm"
          variant="outline"
          className="cursor-pointer flex-shrink-0"
        >
          {saving ? "..." : "Lock again"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Lock className="h-4 w-4 flex-shrink-0" />
        Client&apos;s selection is locked. If they need to change it,
        unlock it here.
      </div>
      <Button
        onClick={handleUnlock}
        disabled={saving}
        size="sm"
        variant="outline"
        className="cursor-pointer flex-shrink-0"
      >
        {saving ? "..." : "Unlock for client"}
      </Button>
    </div>
  );
}