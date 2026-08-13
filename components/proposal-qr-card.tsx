"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { getProposalUrl, markQuoteAsSent } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface ProposalQrCardProps {
  quoteId: string;
  publicToken: string;
  proposalStatus: string;
  onSent?: () => void;
}

// Shared across all clients — just pass quoteId + publicToken for
// each quote, nothing hardcoded for any specific client.
export function ProposalQrCard({
  quoteId,
  publicToken,
  proposalStatus,
  onSent,
}: ProposalQrCardProps) {
  const [marking, setMarking] = useState(false);

  const url = getProposalUrl(publicToken);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url);
    toast.success("Proposal link copied.");
  }

  async function handleMarkSent() {
    setMarking(true);
    try {
      await markQuoteAsSent(quoteId);
      toast.success("Marked as sent to client.");
      onSent?.();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <h2 className="font-semibold">Proposal Link / QR Code</h2>

      <div className="flex flex-col items-center gap-3 py-2">
        <div className="bg-white p-3 rounded-lg border">
          <QRCodeSVG value={url} size={180} />
        </div>
        <p className="text-xs text-slate-500 break-all text-center">{url}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex-1 cursor-pointer"
        >
          Copy Link
        </Button>

        <Button
          onClick={handleMarkSent}
          disabled={marking || proposalStatus !== "draft"}
          className="flex-1 cursor-pointer"
        >
          {proposalStatus === "draft"
            ? marking
              ? "Sending..."
              : "Mark as Sent"
            : `Status: ${proposalStatus}`}
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Print this QR code or send the link to the client. When they scan/open
        it, they can view the proposal, accept it, and (in a later step) pay
        directly on the page — no login required.
      </p>
    </div>
  );
}
