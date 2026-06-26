"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { Quote, getQuote, updateQuote } from "@/lib/quotes";
import { syncLeadStatusFromQuote, updateLeadStatus } from "@/lib/lead";

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadQuote() {
      const data = await getQuote(params.id as string);

      if (!data) return;

      setQuote(data);

      setTitle(data.title);
      setAmount(String(data.amount));
      setNotes(data.notes);
      setStatus(data.status);
    }

    loadQuote();
  }, [params.id]);

  if (!quote) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  async function handleSave() {
    if (!quote) return;

    const oldStatus = quote.status;

    await updateQuote(quote.id, {
      title,
      amount: Number(amount),
      notes,
      status,
    });

    // const leadStatus = await syncLeadStatusFromQuote(status);

    // await updateLeadStatus(quote.lead_id, leadStatus);

    // Đồng bộ Lead Status
    // if (oldStatus !== status) {
    //   switch (status) {
    //     case "Sent":
    //       await updateLeadStatus(quote.lead_id, "Proposal Sent");
    //       break;

    //     case "Accepted":
    //       await updateLeadStatus(quote.lead_id, "Won");
    //       break;

    //     case "Rejected":
    //       await updateLeadStatus(quote.lead_id, "Lost");
    //       break;
    //   }
    // }
    if (oldStatus !== status) {
      const leadStatus = await syncLeadStatusFromQuote(status);
      await updateLeadStatus(quote.lead_id, leadStatus);
    }

    alert("Quote updated!");

    router.push(`/crm/quotes/${quote.id}`);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Quote</h1>

          <p className="text-slate-500 mt-2">Update quotation details.</p>
        </div>

        <div className="border rounded-xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium">Quote Title</label>

            <input
              className="w-full border rounded-lg p-2 mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>

            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>

            <select
              className="w-full border rounded-lg p-2 mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Draft</option>
              <option>Sent</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>

            <textarea
              rows={5}
              className="w-full border rounded-lg p-2 mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </AppLayout>
  );
}
