"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { createLead } from "@/lib/crm/lead";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { toast } from "sonner";

// Ô chọn quốc gia có tìm kiếm — gõ vài chữ để lọc thay vì cuộn qua
// gần 200 dòng trong dropdown mặc định của trình duyệt.
function CountryCodePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === value);

  const filtered = COUNTRY_CODES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-52 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border p-2 text-sm"
      >
        <span className="truncate">{selected?.label || "Select country"}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-lg border bg-white shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country..."
            className="w-full border-b p-2 text-sm outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-3 text-sm text-slate-400">No country found.</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  onChange(c.code, c.label);
                  setOpen(false);
                  setQuery("");
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewLeadPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [source, setSource] = useState("Referral");
  const [priority, setPriority] = useState("Medium");

  const [saving, setSaving] = useState(false);

  async function handleCreateLead() {
    if (!companyName.trim() || !contactName.trim()) {
      toast.warning("Please enter company name and contact name.");
      return;
    }

    // Bắt buộc Email — dùng để gửi Proposal, Payment Receipt, và mời
    // vào Client Portal sau này. Thiếu email khiến các tính năng đó
    // không hoạt động được.
    if (!email.trim()) {
      toast.warning(
        "Email is required — it's needed to send proposals, receipts, and portal access later.",
      );
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const fullPhone = phoneNumber.trim()
        ? `${countryCode} ${phoneNumber.trim()}`
        : "";

      const lead = await createLead({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        email: email.trim(),
        phone: fullPhone,
        department: department.trim(),
        source,
        priority,
      });

      toast.success("Lead created successfully!");
      router.push(`/crm/leads/${lead.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Lead</h1>
          <p className="text-slate-500">
            Add a new sales opportunity to the CRM.
          </p>
        </div>

        <div className="border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Vincent's Café"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Vincent Nguyen"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="vincent@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <div className="mt-1 flex gap-2">
              <CountryCodePicker
                value={countryCode}
                onChange={(code) => setCountryCode(code)}
              />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 rounded-lg border p-2"
                placeholder="900 000 000"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Operations"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option>Referral</option>
              <option>Website</option>
              <option>Cold Outreach</option>
              <option>Event</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <Button
            onClick={handleCreateLead}
            disabled={saving}
            className="cursor-pointer"
          >
            {saving ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
