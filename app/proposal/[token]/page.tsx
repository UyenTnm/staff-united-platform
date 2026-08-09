"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProposalFlipbook } from "@/components/proposal-flipbook";

import {
  Quote,
  getQuoteByToken,
  markQuoteAsViewed,
  acceptQuoteByToken,
} from "@/lib/crm/quotes";
import { toast } from "sonner";

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [accepting, setAccepting] = useState(false);
  const [name, setName] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getQuoteByToken(token);

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setQuote(data);
      setLoading(false);

      markQuoteAsViewed(token);
    }

    if (token) load();
  }, [token]);

  async function handleAccept() {
    if (!name.trim()) {
      toast.warning("Please enter your name to confirm.");
      return;
    }

    setAccepting(true);
    try {
      await acceptQuoteByToken(token, name.trim(), clientNotes.trim());
      toast.success("Proposal accepted. Thank you!");

      const updated = await getQuoteByToken(token);
      setQuote(updated);
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong. Please try again or contact us directly.",
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Proposal not found</h1>
          <p className="text-slate-500 mt-2">
            This link is invalid or has expired. Please contact us for
            assistance.
          </p>
        </div>
      </div>
    );
  }

  const isAccepted =
    quote.proposal_status === "accepted" || quote.proposal_status === "paid";
  const isPaid = quote.proposal_status === "paid";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{quote.title}</h1>
          <p className="text-slate-500 mt-1">
            Prepared for {quote.contact_name} — {quote.company_name}
          </p>
        </div>

        {/* Flipbook proposal (Canva PDF converted to page-flip), or fallback */}
        {quote.proposal_pdf_url ? (
          <ProposalFlipbook pdfUrl={quote.proposal_pdf_url} />
        ) : (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-slate-500">Quote Number</span>
              <span className="font-medium">{quote.quote_number}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-slate-500">Total Amount</span>
              <span className="text-2xl font-bold">
                ${quote.amount.toLocaleString()} AUD
              </span>
            </div>

            {quote.notes && (
              <div>
                <p className="text-slate-500 mb-1">Details</p>
                <p className="whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Accepted / paid status */}
        {isAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="font-medium text-green-800">
              {isPaid
                ? "✓ Payment received — thank you!"
                : `✓ Accepted by ${quote.accepted_by_name}`}
            </p>
            {!isPaid && (
              <p className="text-sm text-green-700 mt-2">
                We&apos;ll be in touch shortly with payment instructions.
              </p>
            )}
          </div>
        )}

        {/* Accept form — only shown before acceptance */}
        {!isAccepted && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Accept this proposal</h2>

            <div>
              <label className="text-sm font-medium">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                rows={3}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full"
            >
              {accepting ? "Processing..." : "Accept Proposal"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
