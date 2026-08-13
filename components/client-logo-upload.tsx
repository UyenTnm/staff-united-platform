"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadClientLogo } from "@/lib/crm/quotes";
import { toast } from "sonner";

interface ClientLogoUploadProps {
  quoteId: string;
  currentLogoUrl: string | null;
  onUploaded?: () => void;
}

// Upload logo công ty khách — dùng cho trang bìa của template proposal
// thống nhất. Thay thế việc mỗi sale tự thiết kế PDF riêng.
export function ClientLogoUpload({
  quoteId,
  currentLogoUrl,
  onUploaded,
}: ClientLogoUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file.");
      return;
    }

    setUploading(true);
    try {
      await uploadClientLogo(quoteId, file);
      toast.success("Client logo uploaded!");
      onUploaded?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Client Logo
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Upload the client&apos;s company logo — it will appear on the cover page
        of the proposal.
      </p>

      {currentLogoUrl && (
        <div className="mb-4 flex justify-center rounded-lg border border-dashed border-slate-200 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLogoUrl}
            alt="Client logo"
            className="h-16 object-contain"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="text-sm"
      />

      {uploading && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
    </div>
  );
}
