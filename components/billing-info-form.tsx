"use client";

import { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBillingInfo } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface BillingInfoFormProps {
  quoteId: string;
  existing: {
    billing_company_name: string | null;
    billing_address: string | null;
    billing_tax_code: string | null;
    billing_email: string | null;
    billing_contact_person: string | null;
  };
}

// Khách tự điền thông tin xuất hóa đơn — không bắt buộc (chỉ cần nếu
// khách muốn nhận hóa đơn VAT chính thức). Kế toán dùng thông tin
// này để nhập tay vào MISA meInvoice.
export function BillingInfoForm({ quoteId, existing }: BillingInfoFormProps) {
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
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateBillingInfo(
        quoteId,
        {
          billing_company_name: companyName.trim(),
          billing_address: address.trim(),
          billing_tax_code: taxCode.trim(),
          billing_email: email.trim(),
          billing_contact_person: contactPerson.trim(),
        },
        "client",
      );
      toast.success("Billing information saved.");
      setSaved(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save billing information.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Billing information saved.
        </div>
        <button
          onClick={() => setSaved(false)}
          className="cursor-pointer text-xs font-medium underline"
        >
          Edit again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-emerald-600" />
        <h2 className="font-semibold text-slate-900">
          Invoice details (optional)
        </h2>
      </div>
      <p className="text-sm text-slate-500">
        If you need an official VAT invoice, please fill in your billing
        details below. Leave blank if you don&apos;t need one.
      </p>

      <div className="space-y-3">
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name (on invoice)"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Billing address"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <input
          value={taxCode}
          onChange={(e) => setTaxCode(e.target.value)}
          placeholder="Tax code / MST (if applicable)"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email to receive the invoice"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        <input
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="Contact person"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        variant="outline"
        className="w-full cursor-pointer"
      >
        {saving ? "Saving..." : "Save billing info"}
      </Button>
    </div>
  );
}