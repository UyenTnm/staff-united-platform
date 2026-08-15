"use client";

import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { uploadProposalPdf } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface ProposalPdfUploadProps {
  quoteId: string;
  currentPdfUrl: string | null;
  proposalStatus?: string;
  onUploaded?: () => void;
}

// Dùng chung cho mọi client — upload PDF proposal thiết kế từ Canva.
// Giao diện dạng "click hoặc kéo thả để upload" — rõ ràng có thể bấm.
export function ProposalPdfUpload({
  quoteId,
  currentPdfUrl,
  proposalStatus,
  onUploaded,
}: ProposalPdfUploadProps) {
  const isLocked = proposalStatus === "accepted" || proposalStatus === "paid";
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">
        Option A — Upload PDF (Canva design)
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        If you&apos;ve designed the proposal yourself in Canva, export it as PDF
        and upload it here.
      </p>

      {currentPdfUrl ? (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                PDF uploaded
              </p>
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 underline"
              >
                View current PDF
              </a>
            </div>
          </div>
          {!isLocked && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="cursor-pointer rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Replace
            </button>
          )}
        </div>
      ) : isLocked ? (
        <p className="mt-4 text-sm text-slate-400">
          🔒 Locked — client has already accepted this proposal, so a PDF can no
          longer be added here.
        </p>
      ) : (
        // Vùng click/kéo-thả — rõ ràng đây là 1 vùng có thể bấm được,
        // không chỉ là input file mờ nhạt như trước.
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={uploading}
          className={`mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragOver
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
          }`}
        >
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            {uploading ? "Uploading..." : "Click to choose a PDF file"}
          </p>
          <p className="text-xs text-slate-400">or drag and drop it here</p>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
