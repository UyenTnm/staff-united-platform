"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadCoverImage } from "@/lib/crm/quotes";

interface CoverImageUploadProps {
  quoteId: string;
  currentImageUrl: string | null;
  onUploaded?: () => void;
}

// Upload ảnh nền/hero cho trang bìa — khác với logo công ty khách
// (ClientLogoUpload). Trang bìa hiển thị cả 2: logo STAFF United
// (tĩnh) + logo khách + ảnh bìa này (tùy chọn).
export function CoverImageUpload({
  quoteId,
  currentImageUrl,
  onUploaded,
}: CoverImageUploadProps) {
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
      await uploadCoverImage(quoteId, file);
      toast.success("Cover image uploaded!");
      onUploaded?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload cover image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cover Background Image (optional)
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Upload a background photo for the cover page — e.g. an office, product,
        or brand image. Leave empty to use the default navy background.
      </p>

      {currentImageUrl && (
        <div className="mb-4 overflow-hidden rounded-lg border border-dashed border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImageUrl}
            alt="Cover background"
            className="h-32 w-full object-cover"
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
