"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadProposalPdf } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface ProposalPdfUploadProps {
  quoteId: string;
  currentPdfUrl: string | null;
  onUploaded?: () => void;
}

// Shared across all clients — upload the Canva-designed proposal PDF
// here, no need to change code per client.
export function ProposalPdfUpload({
  quoteId,
  currentPdfUrl,
  onUploaded,
}: ProposalPdfUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.warning("Please select a PDF file.");
      return;
    }

    setUploading(true);
    try {
      await uploadProposalPdf(quoteId, file);
      toast.success("Proposal PDF uploaded successfully!");
      onUploaded?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload PDF. Please check the Storage bucket.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <h2 className="font-semibold">Proposal PDF (Canva design)</h2>

      {currentPdfUrl ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            A proposal file is attached. The client will see this file when they
            open the link/QR code.
          </p>
          <a
            href={currentPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-blue-600"
          >
            View current PDF
          </a>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No PDF yet. Export the proposal from Canva as PDF, then upload it
          below.
        </p>
      )}

      <div>
        <label className="text-sm font-medium block mb-2">
          {currentPdfUrl ? "Replace with another file" : "Choose PDF file"}
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm cursor-pointer"
        />
      </div>

      {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
    </div>
  );
}
