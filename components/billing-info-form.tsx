"use client";

import { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBillingInfo } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface BillingInfoFormProps {
  quoteId: string;
  quoteNumber: string;
  // companyName: string;
  existing: {
    billing_company_name: string | null;
    billing_address: string | null;
    billing_tax_code: string | null;
    billing_email: string | null;
    billing_cc_email: string | null;
    billing_contact_person: string | null;
  };
}

// Khách xác nhận/điền thông tin xuất hóa đơn — có LABEL rõ ràng (không
// chỉ dựa vào placeholder), tự điền sẵn nếu sale đã nhập trước đó,
// khách chỉ cần XÁC NHẬN LẠI hoặc sửa nếu sai. Có thêm ô Email phụ
// (CC) — dùng khi cần gửi kèm cho người khác (VD: kế toán khách).
export function BillingInfoForm({
  quoteId,
  quoteNumber,
  // companyName,
  existing,
}: BillingInfoFormProps) {
  const [companyName, setCompanyName] = useState(
    existing.billing_company_name || "",
  );
  const [address, setAddress] = useState(existing.billing_address || "");
  const [taxCode, setTaxCode] = useState(existing.billing_tax_code || "");
  const [email, setEmail] = useState(existing.billing_email || "");
  const [ccEmail, setCcEmail] = useState(existing.billing_cc_email || "");
  const [contactPerson, setContactPerson] = useState(
    existing.billing_contact_person || "",
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sale đã điền sẵn ít nhất 1 trường — khách chỉ cần XÁC NHẬN, không
  // phải điền từ đầu.
  const prefilledBySale = Boolean(
    existing.billing_company_name ||
    existing.billing_tax_code ||
    existing.billing_email,
  );

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
          billing_cc_email: ccEmail.trim(),
          billing_contact_person: contactPerson.trim(),
        },
        "client",
      );
      toast.success("Billing information confirmed.");

      // Báo cho Sale biết khách vừa xác nhận Billing Info — qua API
      // route (không thể ghi trực tiếp vì khách là anon, bảng
      // notifications dùng chung với Academy).
      try {
        await fetch("/api/proposal/notify-billing-confirmed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId }),
        });
      } catch (notifyErr) {
        console.error("Failed to notify sale:", notifyErr);
      }
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
          Billing information confirmed.
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
          {prefilledBySale
            ? "Confirm invoice details"
            : "Invoice details (optional)"}
        </h2>
      </div>
      <p className="text-sm text-slate-500">
        {prefilledBySale
          ? "Please review the details below and correct anything that's wrong before confirming."
          : "If you need an official VAT invoice, please fill in your billing details below. Leave blank if you don't need one."}
      </p>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Company name (on invoice)
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. ABC Trading Co., Ltd"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Billing address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, District, City"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Tax code / MST{" "}
            <span className="font-normal text-slate-400">
              (only if you need a VAT invoice)
            </span>
          </label>
          <input
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            placeholder="e.g. 0312345678"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Email to receive invoice
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@company.com"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            CC email{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="email"
            value={ccEmail}
            onChange={(e) => setCcEmail(e.target.value)}
            placeholder="e.g. your accountant's email"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Contact person
          </label>
          <input
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        variant="outline"
        className="w-full cursor-pointer"
      >
        {saving
          ? "Saving..."
          : prefilledBySale
            ? "Confirm billing info"
            : "Save billing info"}
      </Button>
    </div>
  );
}
