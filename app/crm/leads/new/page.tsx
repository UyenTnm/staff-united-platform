"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { createLead } from "@/lib/crm/lead";
import { toast } from "sonner";

export default function NewLeadPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [source, setSource] = useState("Referral");
  const [priority, setPriority] = useState("Medium");

  const [saving, setSaving] = useState(false);

  async function handleCreateLead() {
    if (!companyName.trim() || !contactName.trim()) {
      toast.warning("Please enter company name and contact name.");
      return;
    }

    setSaving(true);
    try {
      const lead = await createLead({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
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
            <label className="text-sm font-medium">Email</label>
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
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="0900 000 000"
            />
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

          <Button onClick={handleCreateLead} disabled={saving}>
            {saving ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
