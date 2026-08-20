"use client";

import { forwardRef, useId, useRef, useState } from "react";
import {
  User,
  Building2,
  Calendar,
  Eye,
  MessageCircle,
  Handshake,
  TrendingUp,
  Camera,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { QuoteItem, getItemTotal } from "@/lib/crm/quote-items";
import {
  PackageDetailData,
  PricingOverviewData,
  NextStepsData,
} from "@/lib/crm/quote-pages";
import { uploadCoverImage } from "@/lib/crm/quotes";

// ============================================================
// Các component render 1 TRANG proposal, dùng chung ở 2 nơi:
// - Chế độ soạn (ProposalWizard): render standalone, to, để sale
//   xem ngay trang mình vừa nhập.
// - Chế độ xem tổng thể (ProposalTemplateFlipbook): render bên
//   trong HTMLFlipBook, có nút bút chì (onEdit) để nhảy về sửa.
// ============================================================

export const NAVY =
  "bg-gradient-to-br from-[#0a1a3c] via-[#0f2454] to-[#123a7a]";

function getTitleFontSizeClass(title: string): string {
  const len = title.length;
  if (len <= 20) return "text-2xl";
  if (len <= 36) return "text-xl";
  if (len <= 55) return "text-lg";
  return "text-base";
}

function EditButton({ onEdit }: { onEdit?: () => void }) {
  if (!onEdit) return null;
  return (
    <button
      type="button"
      onClick={onEdit}
      className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white"
      title="Edit this page"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

// ---- Trang bìa (v2 — dùng ảnh nền Canva thật, không tự vẽ CSS/SVG) ----
export const CoverPage = forwardRef<
  HTMLDivElement,
  {
    companyName: string;
    contactName: string;
    title: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    packageTitles: string[];
    headingFontCss: string;
    editable?: boolean;
    quoteId?: string;
    onCoverImageUploaded?: () => void;
    onEdit?: () => void;
  }
>(
  (
    {
      companyName,
      contactName,
      title,
      logoUrl,
      coverImageUrl,
      packageTitles,
      headingFontCss,
      editable = false,
      quoteId,
      onCoverImageUploaded,
      onEdit,
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    // const clipId = useId();
    // const waveClipId = useId();

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !quoteId) return;
      if (!file.type.startsWith("image/")) {
        toast.warning("Please select an image file.");
        return;
      }
      setUploading(true);
      try {
        await uploadCoverImage(quoteId, file);
        toast.success("Cover image uploaded!");
        onCoverImageUploaded?.();
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload cover image.");
      } finally {
        setUploading(false);
      }
    }

    const maskStyle: React.CSSProperties = {
      WebkitMaskImage: "url(/templates/proposal-cover-mask.png)",
      WebkitMaskSize: "100% 100%",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "0 0",
      maskImage: "url(/templates/proposal-cover-mask.png)",
      maskSize: "100% 100%",
      maskRepeat: "no-repeat",
      maskPosition: "0 0",
    };

    return (
      <div
        ref={ref}
        className="relative h-full w-full overflow-hidden bg-[#0d294c]"
        style={{ aspectRatio: "1655 / 2340" }}
      >
        <EditButton onEdit={onEdit} />

        {/* Ảnh nền Canva thật — mọi hình khối/màu/icon nằm sẵn ở đây */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/templates/proposal-cover-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {coverImageUrl && (
          <div className="absolute inset-0 h-full w-full" style={maskStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {editable && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 h-full w-full bg-black/0 text-xs font-medium text-transparent transition hover:bg-black/10"
              style={maskStyle}
            >
              <span className="flex h-full w-full items-center justify-center hover:bg-black/40 hover:text-white">
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          </>
        )}

        {/* ---- Overlay: Partner Company Logo ---- */}
        <div
          className="absolute flex items-center"
          style={{ left: "30%", top: "4%", width: "36%", height: "8%" }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="max-h-full max-w-full object-contain"
            />
          ) : editable ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-300/50">
              Partner logo
            </p>
          ) : null}
        </div>

        {/* ---- Overlay: Project Title — tự co chữ theo độ dài ---- */}
        <h1
          className={`absolute line-clamp-3 font-bold leading-tight text-white ${getTitleFontSizeClass(title)}`}
          style={{
            left: "5%",
            top: "14%",
            width: "58%",
            fontFamily: headingFontCss,
          }}
        >
          {title}
        </h1>

        {/* ---- Overlay: Package Titles ×4 ---- */}
        {packageTitles.length > 0 && (
          <div
            className="absolute space-y-1"
            style={{ left: "5%", top: "35%", width: "58%" }}
          >
            {packageTitles.slice(0, 4).map((name, i) => (
              <p key={i} className="text-sm text-white/90">
                {name}
              </p>
            ))}
          </div>
        )}

        {/* ---- Overlay: Client / Company Name ---- */}
        <p
          className="absolute text-[10px] font-bold text-white"
          style={{ left: "12%", top: "51%", width: "50%" }}
        >
          {companyName} ({contactName})
        </p>

        {/* ---- Overlay: Date ---- */}
        <p
          className="absolute text-[10px] font-bold text-white"
          style={{ left: "12%", top: "66%", width: "50%" }}
        >
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    );
  },
);
CoverPage.displayName = "CoverPage";

// ---- Trang dịch vụ (1 nhóm, tối đa 5 hạng mục/trang) ----
export const ServicesPage = forwardRef<
  HTMLDivElement,
  {
    items: QuoteItem[];
    currencySymbol: string;
    pageLabel: string;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ items, currencySymbol, pageLabel, headingFontCss, onEdit }, ref) => {
  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col bg-white p-8"
    >
      <EditButton onEdit={onEdit} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
        What&apos;s Included {pageLabel}
      </p>
      <h2
        className="mt-2 text-lg font-bold text-slate-900"
        style={{ fontFamily: headingFontCss }}
      >
        Scope of Services
      </h2>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-slate-100 pb-3 last:border-b-0"
          >
            <div className="flex items-start justify-between">
              <p className="font-medium text-slate-900">{item.service_name}</p>
              <p className="whitespace-nowrap font-semibold text-blue-700">
                {currencySymbol}
                {getItemTotal(item).toLocaleString()}
              </p>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-slate-300">
        STAFF United — {new Date().getFullYear()}
      </p>
    </div>
  );
});
ServicesPage.displayName = "ServicesPage";

// ---- Trang "Package Detail" ----
export const PackageDetailPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    data: PackageDetailData;
    pageNumber: string;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ title, data, pageNumber, headingFontCss, onEdit }, ref) => {
  return (
    <div ref={ref} className="relative flex h-full w-full flex-col bg-white">
      <EditButton onEdit={onEdit} />
      <div className={`${NAVY} px-8 py-6`}>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-blue-300">
            {pageNumber}
          </span>
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-white">
            Project Scope
            <br />& Deliverables
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <h2
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: headingFontCss }}
        >
          {title}
        </h2>

        {data.strategic_objective && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              🎯 Strategic Objective
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {data.strategic_objective}
            </p>
          </div>
        )}

        {data.deliverables?.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Key Deliverables
            </p>
            <ul className="mt-2 space-y-1.5">
              {data.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-blue-600 text-[10px] text-blue-600">
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <div className={`rounded-xl ${NAVY} p-4 text-white`}>
          <p className="text-[10px] font-semibold uppercase text-blue-200">
            Timeline
          </p>
          <p className="mt-1 text-sm font-bold">{data.timeline || "—"}</p>
        </div>
        <div className={`rounded-xl ${NAVY} p-4 text-white`}>
          <p className="text-[10px] font-semibold uppercase text-blue-200">
            Price
          </p>
          <p className="mt-1 text-sm font-bold">{data.price || "—"}</p>
        </div>
      </div>
    </div>
  );
});
PackageDetailPage.displayName = "PackageDetailPage";

// ---- Trang "Pricing Overview" ----
export const PricingOverviewPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    items: QuoteItem[]; // Service Options đã nhập ở trang Quote
    data: PricingOverviewData; // chỉ còn discount_percent
    currencySymbol: string;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ title, items, data, currencySymbol, headingFontCss, onEdit }, ref) => {
  const total = items.reduce((sum, i) => sum + getItemTotal(i), 0);
  const discount = data.discount_percent || 0;
  const finalPrice = total * (1 - discount / 100);
  const saveAmount = total - finalPrice;

  const fmt = (n: number) =>
    `${currencySymbol}${Math.round(n).toLocaleString()}`;

  return (
    <div
      ref={ref}
      className={`relative flex h-full w-full flex-col ${NAVY} p-8`}
    >
      <EditButton onEdit={onEdit} />

      <h2
        className="text-2xl font-bold text-white"
        style={{ fontFamily: headingFontCss }}
      >
        {title}
      </h2>
      <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
        Scope of Services
      </p>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{item.service_name}</p>
              <p className="whitespace-nowrap font-bold text-blue-200">
                {fmt(getItemTotal(item))}
              </p>
            </div>
            {item.description && (
              <p className="mt-1 text-xs text-blue-200/80">
                {item.description}
              </p>
            )}
          </div>
        ))}

        {items.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/15 pt-2 text-sm text-white/80">
            <span>Subtotal</span>
            <span>{fmt(total)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="mt-4 rounded-xl border border-blue-400/50 bg-blue-950/40 p-4">
            <p className="text-sm font-bold uppercase text-blue-200">
              Strategic Partnership Rate
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-extrabold text-white">
                {fmt(finalPrice)}
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900">
                {discount}% Off
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-200">Save {fmt(saveAmount)}</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-white/20 p-3 text-xs text-blue-200">
        <p className="mb-1 font-semibold uppercase text-white">Payment Terms</p>
        <p>50% deposit required to initiate the project.</p>
        <p>50% final payment due upon completion and delivery.</p>
      </div>
    </div>
  );
});
PricingOverviewPage.displayName = "PricingOverviewPage";

// ---- Trang "Next Steps" ----
export const NextStepsPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    data: NextStepsData;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ title, data, headingFontCss, onEdit }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative flex h-full w-full flex-col justify-between ${NAVY} p-8`}
    >
      <EditButton onEdit={onEdit} />
      <div>
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: headingFontCss }}
        >
          {title}
        </h2>

        <ul className="mt-6 space-y-3">
          {data.items?.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-blue-100"
            >
              {data.list_style === "numbered" ? (
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/30 text-xs font-bold text-white">
                  {i + 1}
                </span>
              ) : (
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
              )}
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {data.closing_note && (
        <p className="mt-8 whitespace-pre-line text-center text-xs italic text-blue-200">
          {data.closing_note}
        </p>
      )}

      <div className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] text-blue-300">
        STAFF United — All Women Offshore Execution Team
      </div>
    </div>
  );
});
NextStepsPage.displayName = "NextStepsPage";

// ---- Trang nội dung tự do (Custom Page) ----
export const ContentPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    content: string;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ title, content, headingFontCss, onEdit }, ref) => {
  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col bg-white p-8"
    >
      <EditButton onEdit={onEdit} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
        STAFF United
      </p>
      <h2
        className="mt-2 text-lg font-bold text-slate-900"
        style={{ fontFamily: headingFontCss }}
      >
        {title}
      </h2>

      <div className="mt-6 flex-1 overflow-y-auto">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {content}
        </p>
      </div>

      <p className="mt-4 text-center text-[10px] text-slate-300">
        STAFF United — {new Date().getFullYear()}
      </p>
    </div>
  );
});
ContentPage.displayName = "ContentPage";
