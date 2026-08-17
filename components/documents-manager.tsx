"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload, Download } from "lucide-react";
import {
  QuoteDocument,
  DocumentCategory,
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "@/lib/crm/documents";
import { toast } from "sonner";

interface DocumentsManagerProps {
  quoteId: string;
}

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  contract: "Contract",
  deliverable: "Deliverable",
  invoice: "Invoice",
  other: "Other",
};

// Sale upload file (hợp đồng, deliverable, hóa đơn...) cho từng
// Quote — khách sẽ tự tải về trong Client Portal.
export function DocumentsManager({ quoteId }: DocumentsManagerProps) {
  const [documents, setDocuments] = useState<QuoteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("contract");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    const data = await getDocuments(quoteId);
    setDocuments(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDocuments();
  }, [quoteId]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocument(quoteId, file, category);
      toast.success("Document uploaded.");
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDocument(id);
      toast.success("Document removed.");
      await loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove document.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Documents
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Upload contracts, deliverables, or invoices — the client can download
        these from their Portal.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-slate-400">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {CATEGORY_LABEL[doc.category]} —{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
