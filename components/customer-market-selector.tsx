"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { updateCustomerMarket, CustomerMarket } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface CustomerMarketSelectorProps {
  quoteId: string;
  currentMarket: CustomerMarket | null;
  proposalStatus: string;
  onUpdated: () => void;
}

// Chọn thị trường khách hàng — quyết định trang public hiện VietQR
// (Vietnam) hay Wire Transfer USD (International). Khóa hẳn khi quote
// đã ở trạng thái "paid" — đổi market sau khi đã nhận tiền sẽ làm
// lệch thông tin thanh toán đã xác nhận.
export function CustomerMarketSelector({
  quoteId,
  currentMarket,
  proposalStatus,
  onUpdated,
}: CustomerMarketSelectorProps) {
  const isLocked = proposalStatus === "paid";
  const [saving, setSaving] = useState(false);

  async function handleChange(market: CustomerMarket) {
    if (isLocked) return;

    setSaving(true);
    try {
      await updateCustomerMarket(quoteId, market);
      toast.success(
        `Customer market set to ${market === "vietnam" ? "Vietnam (VietQR)" : "International (USD Wire)"}.`,
      );
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer market.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Customer Market
      </h2>
      <p className="mb-3 text-sm text-slate-500">
        This determines which payment method the client sees: VietQR bank
        transfer for Vietnam, or international wire transfer (USD) for clients
        abroad.
      </p>

      {isLocked && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="h-4 w-4 flex-shrink-0" />
          Payment has been confirmed — market is locked to keep records
          consistent with the completed payment.
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleChange("vietnam")}
          disabled={saving || isLocked}
          className={`flex-1 rounded-lg border p-3 text-sm font-medium transition ${
            isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${
            currentMarket === "vietnam"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          🇻🇳 Vietnam (VietQR)
        </button>
        <button
          onClick={() => handleChange("international")}
          disabled={saving || isLocked}
          className={`flex-1 rounded-lg border p-3 text-sm font-medium transition ${
            isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${
            currentMarket === "international"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          🌍 International (USD Wire)
        </button>
      </div>

      {!currentMarket && !isLocked && (
        <p className="mt-2 text-xs text-amber-600">
          Not set yet — defaults to International (USD Wire) until you choose.
        </p>
      )}
    </div>
  );
}
