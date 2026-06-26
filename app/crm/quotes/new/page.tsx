"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { createQuote } from "@/lib/quotes";
// import { getLead } from "@/lib/lead";
import { getLead, updateLeadStatus, type Lead } from "@/lib/lead";

export default function CreateQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leadId = searchParams.get("leadId");
  const [lead, setLead] = useState<Lead | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadLead() {
      if (!leadId) return;
      const data = await getLead(leadId);

      setLead(data);
    }
    loadLead();
  }, [leadId]);

  async function handleCreateQuote() {
    if (!leadId || !lead) {
      alert("Lead ID not found.");
      return;
    }

    try {
      await createQuote({
        lead_id: lead.id,

        company_name: lead.company_name,
        contact_name: lead.contact_name,
        department: lead.department,

        title,
        amount: Number(amount),
        notes,
      });
      // Update Lead Status
      await updateLeadStatus(lead.id, "Proposal Sent");

      alert("Quote created successfully!");

      router.push("/crm/quotes");
    } catch (err) {
      console.error(err);
      alert("Failed to create quote.");
    }
  }
  if (!lead) {
    return (
      <AppLayout>
        <div className="p-6">Loading lead...</div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Quote</h1>
          <p className="text-slate-500">Create a proposal for this lead.</p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Lead Information</h2>

          <div className="space-y-2">
            <p>
              <strong>Company:</strong> {lead.company_name}
            </p>

            <p>
              <strong>Contact:</strong> {lead.contact_name}
            </p>

            <p>
              <strong>Department:</strong> {lead.department}
            </p>
          </div>
        </div>

        <div className="border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Quote Title</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Strategic Operations Package"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="2500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <Button onClick={handleCreateQuote}>Create Quote</Button>
        </div>
      </div>
    </AppLayout>
  );
}
