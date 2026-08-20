"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateProposalFonts } from "@/lib/crm/quotes";
import { HEADING_FONTS, BODY_FONTS } from "@/lib/proposal-fonts";

interface FontPickerProps {
  quoteId: string;
  currentHeadingFont: string | null;
  currentBodyFont: string | null;
  onSaved?: (headingFont: string, bodyFont: string) => void;
}

// Cho sale chọn font tiêu đề + font nội dung cho riêng proposal này
// (từ danh sách đã duyệt sẵn) — không bắt buộc phải dùng đúng
// Playfair Display / Poppins mặc định.
export function FontPicker({
  quoteId,
  currentHeadingFont,
  currentBodyFont,
  onSaved,
}: FontPickerProps) {
  const [headingFont, setHeadingFont] = useState(
    currentHeadingFont || HEADING_FONTS[0].value,
  );
  const [bodyFont, setBodyFont] = useState(
    currentBodyFont || BODY_FONTS[0].value,
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProposalFonts(quoteId, {
        font_heading: headingFont,
        font_body: bodyFont,
      });
      toast.success("Fonts updated.");
      onSaved?.(headingFont, bodyFont);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update fonts.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Typography
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Choose the heading and body fonts used across this proposal.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Heading font
          </label>
          <select
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {HEADING_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Body font
          </label>
          <select
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {BODY_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        variant="outline"
        className="mt-4 w-full"
      >
        {saving ? "Saving..." : "Save Fonts"}
      </Button>
    </div>
  );
}
