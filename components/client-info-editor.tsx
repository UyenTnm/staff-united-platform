"use client";

import { useState } from "react";
import { Pencil, Lock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateClientInfo } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface ClientInfoEditorProps {
  quoteId: string;
  proposalStatus: string;
  existing: {
    company_name: string;
    contact_name: string;
    department: string;
    contact_email: string | null;
    contact_phone: string | null;
  };
  onSaved?: () => void;
}

// Sửa thông tin khách hàng gốc (Company/Contact/Department/Email/
// Phone) ngay trên quote — bấm icon bút chì để bật chế độ sửa. Khóa
// hẳn khi quote đã Paid.
export function ClientInfoEditor({
  quoteId,
  proposalStatus,
  existing,
  onSaved,
}: ClientInfoEditorProps) {
  const isLocked = proposalStatus === "paid";

  const [editing, setEditing] = useState(false);
  const [companyName, setCompanyName] = useState(existing.company_name);
  const [contactName, setContactName] = useState(existing.contact_name);
  const [department, setDepartment] = useState(existing.department || "");
  const [email, setEmail] = useState(existing.contact_email || "");
  const [phone, setPhone] = useState(existing.contact_phone || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!companyName.trim() || !contactName.trim()) {
      toast.warning("Company name and contact name are required.");
      return;
    }

    setSaving(true);
    try {
      await updateClientInfo(quoteId, {
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        department: department.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim(),
      });
      toast.success("Client information updated.");
      setEditing(false);
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update client information.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setCompanyName(existing.company_name);
    setContactName(existing.contact_name);
    setDepartment(existing.department || "");
    setEmail(existing.contact_email || "");
    setPhone(existing.contact_phone || "");
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Client Information
        </h2>

        {isLocked ? (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Lock className="h-3.5 w-3.5" />
            Locked (Paid)
          </span>
        ) : !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-brand-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer text-brand-600 hover:text-brand-700"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Company</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {existing.company_name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Contact</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {existing.contact_name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Department</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {existing.department || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {existing.contact_email || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {existing.contact_phone || "—"}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-2">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact name"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
