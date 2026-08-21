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

// ============================================================
// ---- Trang bìa (dùng CSS mask lấy trực tiếp từ ảnh nền,
// pixel-perfect, không cần path SVG) ----
// ============================================================
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
        // style={{ aspectRatio: "1655 / 2340" }}
      >
        <EditButton onEdit={onEdit} />

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

        <p
          className="absolute text-[10px] font-bold text-white"
          style={{ left: "12%", top: "51%", width: "50%" }}
        >
          {companyName} ({contactName})
        </p>

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

// ============================================================
// ---- Trang "Package Detail" (dùng ảnh nền thật) ----
// ============================================================
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
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-white"
      // style={{ aspectRatio: "1414 / 2000" }}
    >
      <EditButton onEdit={onEdit} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/proposal-package-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <p
        className="absolute text-2xl font-extrabold text-blue-300"
        style={{ left: "43%", top: "5.5%" }}
      >
        {pageNumber}
      </p>

      <h2
        className="absolute font-bold text-slate-900"
        style={{
          left: "5%",
          top: "8.3%",
          width: "60%",
          fontFamily: headingFontCss,
          fontSize: "1.1rem",
        }}
      >
        {title}
      </h2>

      <p
        className="absolute whitespace-pre-line text-sm leading-relaxed text-slate-700"
        style={{ left: "5%", top: "17.5%", width: "45%" }}
      >
        {data.strategic_objective}
      </p>

      <div
        className="absolute space-y-2"
        style={{ left: "9%", top: "56%", width: "45%" }}
      >
        {data.deliverables?.map((d, i) => (
          <p key={i} className="text-sm text-slate-700">
            {d}
          </p>
        ))}
      </div>

      <p
        className="absolute text-sm font-bold text-white"
        style={{ left: "24%", top: "84.5%", width: "20%" }}
      >
        {data.timeline || "—"}
      </p>

      <p
        className="absolute text-sm font-bold text-white"
        style={{ left: "68%", top: "84.5%", width: "25%" }}
      >
        {data.price || "—"}
      </p>
    </div>
  );
});
PackageDetailPage.displayName = "PackageDetailPage";

// ============================================================
// ---- Trang "Pricing Overview" (dùng ảnh nền thật) ----
// ============================================================
// export const PricingOverviewPage = forwardRef<
//   HTMLDivElement,
//   {
//     title: string;
//     data: PricingOverviewData;
//     headingFontCss: string;
//     onEdit?: () => void;
//   }
// >(({ data, onEdit }, ref) => {
//   const pkgRowTops = [0.348, 0.442, 0.535, 0.629];

//   return (
//     <div
//       ref={ref}
//       className="relative h-full w-full overflow-hidden"
//       // style={{ aspectRatio: "1414 / 2000" }}
//     >
//       <EditButton onEdit={onEdit} />

//       {/* eslint-disable-next-line @next/next/no-img-element */}
//       <img
//         src="/templates/proposal-pricing-bg.png"
//         alt=""
//         className="absolute inset-0 h-full w-full object-cover"
//         draggable={false}
//       />

//       {data.packages?.slice(0, 4).map((pkg, i) => (
//         <div key={i}>
//           <p
//             className="absolute font-bold text-white"
//             style={{ left: "10%", top: `${(pkgRowTops[i] + 0.012) * 100}%` }}
//           >
//             {pkg.title}
//           </p>
//           <p
//             className="absolute font-bold text-white"
//             style={{ left: "68%", top: `${(pkgRowTops[i] + 0.012) * 100}%` }}
//           >
//             {pkg.price}
//           </p>
//         </div>
//       ))}

//       <p
//         className="absolute text-2xl font-extrabold text-blue-200"
//         style={{ left: "16%", top: "86%" }}
//       >
//         {data.strategic_partnership_price || "—"}
//       </p>
//       <p
//         className="absolute text-sm font-bold text-blue-900"
//         style={{ left: "72%", top: "84.7%" }}
//       >
//         {data.discount_percent ? `${data.discount_percent}%` : ""}
//       </p>
//       <p
//         className="absolute text-sm text-white"
//         style={{ left: "16%", top: "91.5%" }}
//       >
//         {data.save_amount ? `Save ${data.save_amount}` : ""}
//       </p>
//     </div>
//   );
// });
// PricingOverviewPage.displayName = "PricingOverviewPage";

// ============================================================
// ---- Trang "Pricing Overview" (v3 — có ảnh riêng cho trang này,
// dùng mask khớp dáng blob, KHÁC ảnh Cover) ----
// ============================================================
export const PricingOverviewPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    data: PricingOverviewData;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ data, onEdit }, ref) => {
  const pkgRowTops = [0.348, 0.442, 0.535, 0.629];

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <EditButton onEdit={onEdit} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/proposal-pricing-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {data.image_url && (
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            WebkitMaskImage: "url(/templates/proposal-pricing-mask.png)",
            WebkitMaskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskImage: "url(/templates/proposal-pricing-mask.png)",
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {data.packages?.slice(0, 4).map((pkg, i) => (
        <div key={i}>
          <p
            className="absolute font-bold text-white"
            style={{ left: "10%", top: `${(pkgRowTops[i] + 0.012) * 100}%` }}
          >
            {pkg.title}
          </p>
          <p
            className="absolute font-bold text-white"
            style={{ left: "68%", top: `${(pkgRowTops[i] + 0.012) * 100}%` }}
          >
            {pkg.price}
          </p>
        </div>
      ))}

      <p
        className="absolute text-2xl font-extrabold text-blue-200"
        style={{ left: "16%", top: "86%" }}
      >
        {data.strategic_partnership_price || "—"}
      </p>
      <p
        className="absolute text-sm font-bold text-blue-900"
        style={{ left: "72%", top: "84.7%" }}
      >
        {data.discount_percent ? `${data.discount_percent}%` : ""}
      </p>
      <p
        className="absolute text-sm text-white"
        style={{ left: "16%", top: "91.5%" }}
      >
        {data.save_amount ? `Save ${data.save_amount}` : ""}
      </p>
    </div>
  );
});
PricingOverviewPage.displayName = "PricingOverviewPage";

// ============================================================
// ---- Trang "Strategic Partnership Summary" (MỚI — dùng chung
// PricingOverviewData nhưng layout/ảnh nền khác PricingOverviewPage) ----
// ============================================================
export const PartnershipSummaryPage = forwardRef<
  HTMLDivElement,
  {
    data: PricingOverviewData;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ data, onEdit }, ref) => {
  const rowTops = [0.305, 0.397, 0.442, 0.486];

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-white"
      // style={{ aspectRatio: "1414 / 2000" }}
    >
      <EditButton onEdit={onEdit} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/proposal-partnership-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {data.packages?.slice(0, 4).map((pkg, i) => (
        <div key={i}>
          <p
            className="absolute font-medium text-slate-800"
            style={{ left: "16%", top: `${rowTops[i] * 100}%` }}
          >
            {pkg.title}
          </p>
          <p
            className="absolute font-medium text-slate-800"
            style={{ left: "78%", top: `${rowTops[i] * 100}%` }}
          >
            {pkg.price}
          </p>
        </div>
      ))}

      <p
        className="absolute text-2xl font-extrabold text-blue-700"
        style={{ left: "16%", top: "65.5%" }}
      >
        {data.strategic_partnership_price || "—"}
      </p>
      <p
        className="absolute text-sm font-bold text-blue-700"
        style={{ left: "72%", top: "63.5%" }}
      >
        {data.discount_percent ? `${data.discount_percent}%` : ""}
      </p>
      <p
        className="absolute text-sm font-semibold text-white"
        style={{ left: "16%", top: "73.5%" }}
      >
        {data.save_amount ? `Save ${data.save_amount}` : ""}
      </p>
    </div>
  );
});
PartnershipSummaryPage.displayName = "PartnershipSummaryPage";

// ============================================================
// ---- Trang "Next Steps" (dùng ảnh nền thật) ----
// ============================================================
export const NextStepsPage = forwardRef<
  HTMLDivElement,
  {
    title: string;
    data: NextStepsData;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ data, onEdit }, ref) => {
  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden"
      // style={{ aspectRatio: "1414 / 2000" }}
    >
      <EditButton onEdit={onEdit} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/proposal-nextsteps-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div
        className="absolute space-y-2"
        style={{ left: "20%", top: "50%", width: "65%" }}
      >
        {data.items?.map((step, i) => (
          <p key={i} className="text-base text-white">
            {data.list_style === "numbered" ? `${i + 1}. ` : "• "}
            {step}
          </p>
        ))}
      </div>

      {data.closing_note && (
        <p
          className="absolute whitespace-pre-line text-center text-sm font-semibold text-white"
          style={{ left: "12%", top: "89.5%", width: "76%" }}
        >
          {data.closing_note}
        </p>
      )}
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
