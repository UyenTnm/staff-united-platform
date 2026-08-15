"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBillingInfo, markBillingReviewed } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface BillingInfoEditorProps {
  quoteId: string;
  proposalStatus: string;
  existing: {
    billing_company_name: string | null;
    billing_address: string | null;
    billing_tax_code: string | null;
    billing_email: string | null;
    billing_contact_person: string | null;
  };
  // Nếu khách vừa tự sửa (chưa được sale xem), hiện cảnh báo rõ.
  updatedByClient?: boolean;
  billingUpdatedAt?: string | null;
  onSaved?: () => void;
}

// Cho nhân viên (sale/kế toán) sửa thông tin xuất hóa đơn — dùng khi
// khách gửi sai thông tin, trước hoặc sau khi đã gửi proposal. Khóa
// hẳn khi quote đã ở trạng thái "paid".
export function BillingInfoEditor({
  quoteId,
  proposalStatus,
  existing,
  updatedByClient,
  billingUpdatedAt,
  onSaved,
}: BillingInfoEditorProps) {
  const [dismissing, setDismissing] = useState(false);

  async function handleDismissAlert() {
    setDismissing(true);
    try {
      await markBillingReviewed(quoteId);
      onSaved?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDismissing(false);
    }
  }
  const isLocked = proposalStatus === "paid";

  const [companyName, setCompanyName] = useState(
    existing.billing_company_name || "",
  );
  const [address, setAddress] = useState(existing.billing_address || "");
  const [taxCode, setTaxCode] = useState(existing.billing_tax_code || "");
  const [email, setEmail] = useState(existing.billing_email || "");
  const [contactPerson, setContactPerson] = useState(
    existing.billing_contact_person || "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (isLocked) return;

    setSaving(true);
    try {
      await updateBillingInfo(quoteId, {
        billing_company_name: companyName.trim(),
        billing_address: address.trim(),
        billing_tax_code: taxCode.trim(),
        billing_email: email.trim(),
        billing_contact_person: contactPerson.trim(),
      });
      toast.success("Billing information updated.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update billing information.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Billing Info (editable by staff)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Fill this in yourself if you already have the client&apos;s billing
        details, or correct it here if the client submitted something
        wrong.
      </p>

      {updatedByClient && !isLocked && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <span>
            🔔 Client updated this information
            {billingUpdatedAt &&
              ` on ${new Date(billingUpdatedAt).toLocaleString()}`}
            . Please review.
          </span>
          <button
            onClick={handleDismissAlert}
            disabled={dismissing}
            className="flex-shrink-0 cursor-pointer whitespace-nowrap rounded-md bg-blue-100 px-2 py-1 text-xs font-medium hover:bg-blue-200"
          >
            {dismissing ? "..." : "Mark as reviewed"}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Payment has been confirmed — billing info is locked to keep
            records consistent with the issued invoice.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isLocked}
          placeholder="Company name (on invoice)"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLocked}
          placeholder="Billing address"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
        <input
          value={taxCode}
          onChange={(e) => setTaxCode(e.target.value)}
          disabled={isLocked}
          placeholder="Tax code / MST"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLocked}
          placeholder="Invoice email"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
        <input
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          disabled={isLocked}
          placeholder="Contact person"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

      {!isLocked && (
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="outline"
          className="mt-3 w-full cursor-pointer"
        >
          {saving ? "Saving..." : "Save billing info"}
        </Button>
      )}
    </div>
  );
}