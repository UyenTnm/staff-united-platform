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

// Tiêu đề dài ngắn khác nhau tùy proposal — tự co cỡ chữ theo số ký
// tự thay vì cố định 1 size, tránh vỡ layout khi sale đặt title dài.
// Kèm giới hạn tối đa 3 dòng (line-clamp) làm lưới an toàn cuối cùng
// nếu title vẫn quá dài dù đã co chữ nhỏ nhất.
function getTitleFontSizeClass(title: string): string {
  const len = title.length;
  if (len <= 20) return "text-2xl";
  if (len <= 36) return "text-xl";
  if (len <= 55) return "text-lg";
  return "text-base";
}

// Nút bút chì nổi góc trên phải — chỉ hiện khi có onEdit (tức đang ở
// chế độ Review, cho phép nhảy về sửa đúng trang này).
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

// ---- Trang bìa ----
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
    // editable=true: click vào vùng ảnh để upload (chỉ dùng ở bước
    // soạn trang bìa — ProposalWizard step "cover").
    editable?: boolean;
    quoteId?: string;
    onCoverImageUploaded?: () => void;
    // onEdit: hiện nút bút chì (chỉ dùng ở chế độ Review/flipbook).
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
    const clipId = useId();

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

    return (
      <div
        ref={ref}
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #1a365b 0%, #0d294c 45%, #051f40 100%)",
        }}
      >
        <EditButton onEdit={onEdit} />

        {/* clipPathUnits="objectBoundingBox" => path viết theo tỉ lệ
            0..1. Path này được fit (Catmull-Rom -> cubic Bezier) trực
            tiếp qua các điểm đo pixel thật trên ảnh mẫu gốc 1.png
            (1414x2000px) — không phải áng chừng. Container tương ứng
            box thật: x=[46.7%,100%] (rộng 53.3%), y=[0,60%]. */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath
              id={`cover-blob-${clipId}`}
              clipPathUnits="objectBoundingBox"
            >
              <path d="M1,0 C0.941,0.006 0.725,0.022 0.645,0.033 C0.566,0.044 0.558,0.056 0.525,0.067 C0.493,0.078 0.471,0.089 0.450,0.100 C0.430,0.111 0.417,0.122 0.403,0.133 C0.390,0.144 0.385,0.144 0.368,0.167 C0.351,0.189 0.325,0.228 0.302,0.267 C0.280,0.306 0.258,0.350 0.233,0.400 C0.208,0.450 0.179,0.511 0.152,0.567 C0.125,0.622 0.094,0.689 0.073,0.733 C0.052,0.778 0.039,0.800 0.026,0.833 C0.014,0.867 -0.021,0.906 0,0.933 C0.021,0.961 -0.017,0.989 0.15,1 C0.317,1.011 0.858,1 1,1 L1,0 Z" />
            </clipPath>
            <linearGradient
              id={`wave-grad-${clipId}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#0d294c" />
              <stop offset="50%" stopColor="#4f8ecb" />
              <stop offset="100%" stopColor="#0d294c" />
            </linearGradient>
          </defs>
        </svg>

        {/* ---- Khối trắng dáng giọt nước — dùng đúng box đo được:
            rộng 53.3%, cao 60% trang. ---- */}
        <div
          className="absolute right-0 top-0 overflow-hidden"
          style={{
            height: "60%",
            width: "53.3%",
            backgroundColor: "#c6cdde",
            clipPath: `url(#cover-blob-${clipId})`,
          }}
        >
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Camera className="h-12 w-12 text-slate-400" strokeWidth={1.2} />
            </div>
          )}

          {editable && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-transparent transition hover:bg-black/40 hover:text-white"
            >
              {uploading ? "Uploading..." : "Click to upload image"}
            </button>
          )}
          {editable && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          )}
        </div>

        {/* ---- Dải sóng — path fit qua dữ liệu pixel thật (đã lọc
            nhiễu do đè lên icon Prepared For/By/Date), viewBox 0 0 1 1
            nên tọa độ = % trang trực tiếp. ---- */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0.8 C0.013,0.792 0.053,0.763 0.08,0.75 C0.107,0.737 0.133,0.728 0.16,0.72 C0.187,0.712 0.22,0.705 0.24,0.7 C0.26,0.695 0.267,0.692 0.28,0.689 C0.293,0.686 0.307,0.685 0.32,0.683 C0.333,0.681 0.347,0.680 0.36,0.677 C0.373,0.674 0.387,0.668 0.4,0.663 C0.413,0.659 0.427,0.654 0.44,0.65 C0.453,0.646 0.467,0.642 0.48,0.638 C0.493,0.634 0.507,0.629 0.52,0.625 C0.533,0.621 0.547,0.619 0.56,0.615 C0.573,0.612 0.587,0.607 0.6,0.604 C0.613,0.601 0.627,0.598 0.64,0.595 C0.653,0.592 0.667,0.588 0.68,0.585 C0.693,0.582 0.707,0.579 0.72,0.576 C0.733,0.573 0.747,0.569 0.76,0.565 C0.773,0.561 0.787,0.558 0.8,0.554 C0.813,0.550 0.827,0.545 0.84,0.54 C0.853,0.535 0.867,0.530 0.88,0.525 C0.893,0.520 0.907,0.514 0.92,0.51 C0.933,0.506 0.947,0.475 0.96,0.5 C0.973,0.525 0.993,0.633 1,0.66 L1,0.7 C0.993,0.673 0.973,0.565 0.96,0.54 C0.947,0.515 0.933,0.546 0.92,0.55 C0.907,0.554 0.893,0.56 0.88,0.565 C0.867,0.57 0.853,0.575 0.84,0.58 C0.827,0.585 0.813,0.590 0.8,0.594 C0.787,0.598 0.773,0.601 0.76,0.605 C0.747,0.609 0.733,0.613 0.72,0.616 C0.707,0.619 0.693,0.622 0.68,0.625 C0.667,0.628 0.653,0.632 0.64,0.635 C0.627,0.638 0.613,0.641 0.6,0.644 C0.587,0.647 0.573,0.651 0.56,0.655 C0.547,0.659 0.533,0.661 0.52,0.665 C0.507,0.669 0.493,0.674 0.48,0.678 C0.467,0.682 0.453,0.686 0.44,0.69 C0.427,0.694 0.413,0.699 0.4,0.703 C0.387,0.708 0.373,0.714 0.36,0.717 C0.347,0.720 0.333,0.721 0.32,0.723 C0.307,0.725 0.293,0.726 0.28,0.729 C0.267,0.732 0.26,0.735 0.24,0.74 C0.22,0.745 0.187,0.752 0.16,0.76 C0.133,0.768 0.107,0.777 0.08,0.79 C0.053,0.803 0.013,0.832 0,0.84 Z"
            fill={`url(#wave-grad-${clipId})`}
          />
        </svg>

        <div className="relative z-10 flex flex-1 flex-col px-6 pt-6 text-white">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="STAFF United"
              style={{ height: 28, width: "auto" }}
              className="object-contain"
            />
            <span className="h-5 w-px bg-white/20" />
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={companyName}
                style={{ height: 22, width: "auto" }}
                className="max-w-[90px] object-contain"
              />
            ) : (
              <span className="text-[9px] font-semibold uppercase tracking-wide text-blue-200">
                Partner Company
                <br />
                Logo Here
              </span>
            )}
          </div>

          <h1
            className={`mt-9 line-clamp-3 font-bold leading-tight text-white ${getTitleFontSizeClass(title)}`}
            style={{ fontFamily: headingFontCss }}
          >
            {title}
          </h1>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#4f8ecb" }}
            />
            <span
              className="h-px w-16"
              style={{ backgroundColor: "#4f8ecb" }}
            />
          </div>

          <p
            className="mt-4 text-xl font-extrabold uppercase leading-[1.15]"
            style={{ color: "#4f8ecb" }}
          >
            Proposal
            <br />& Pricing
          </p>

          {packageTitles.length > 0 && (
            <div className="mt-4 space-y-1">
              {packageTitles.slice(0, 4).map((name, i) => (
                <p key={i} className="text-sm text-white/90">
                  {name}
                </p>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: "#4f8ecb" }}
              >
                <User className="h-4 w-4" style={{ color: "#4f8ecb" }} />
              </span>
              <div>
                <p
                  className="font-semibold uppercase tracking-wide"
                  style={{ color: "#4f8ecb" }}
                >
                  Prepared For
                </p>
                <p className="font-medium text-white">
                  {companyName} ({contactName})
                </p>
              </div>
            </div>
            <span className="ml-4 block h-px w-8 bg-white/15" />

            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: "#4f8ecb" }}
              >
                <Building2 className="h-4 w-4" style={{ color: "#4f8ecb" }} />
              </span>
              <div>
                <p
                  className="font-semibold uppercase tracking-wide"
                  style={{ color: "#4f8ecb" }}
                >
                  Prepared By
                </p>
                <p className="font-medium text-white">STAFF United</p>
              </div>
            </div>
            <span className="ml-4 block h-px w-8 bg-white/15" />

            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: "#4f8ecb" }}
              >
                <Calendar className="h-4 w-4" style={{ color: "#4f8ecb" }} />
              </span>
              <div>
                <p
                  className="font-semibold uppercase tracking-wide"
                  style={{ color: "#4f8ecb" }}
                >
                  Date
                </p>
                <p className="font-medium text-white">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Hàng 4 icon — đo được nằm ở y≈0.885 ---- */}
        <div className="relative z-10 flex items-start justify-center gap-0 px-3 pb-4">
          {[
            { icon: Eye, label: "Strong\nVisibility" },
            { icon: MessageCircle, label: "Clear\nCommunication" },
            { icon: Handshake, label: "Trusted\nPartnerships" },
            { icon: TrendingUp, label: "Driving\nGrowth" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-start">
              {i > 0 && <span className="mx-2 mt-1 h-8 w-px bg-white/15" />}
              <div className="flex w-16 flex-col items-center gap-1.5 text-center">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.5}
                  style={{ color: "#4f8ecb" }}
                />
                <p className="whitespace-pre-line text-[8px] font-medium leading-tight text-white/80">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ---- Footer — đo được nằm ở y≈0.965 và 0.985 ---- */}
        <div className="relative z-10 pb-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-3 px-8">
            <span className="h-px flex-1 bg-white/20" />
            <p className="whitespace-nowrap text-[7px] uppercase tracking-widest text-white/70">
              Confidential — For Intended Recipient Only
            </p>
            <span className="h-px flex-1 bg-white/20" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wide">
            <span style={{ color: "#4f8ecb" }}>All Women.</span>{" "}
            <span className="text-white">All Business.</span>
          </p>
        </div>
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
    data: PricingOverviewData;
    headingFontCss: string;
    onEdit?: () => void;
  }
>(({ title, data, headingFontCss, onEdit }, ref) => {
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
        {data.packages?.map((pkg, i) => (
          <div key={i} className="rounded-xl bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{pkg.title}</p>
              <p className="whitespace-nowrap font-bold text-blue-200">
                {pkg.price}
              </p>
            </div>
            {pkg.description && (
              <p className="mt-1 text-xs text-blue-200/80">{pkg.description}</p>
            )}
          </div>
        ))}

        {(data.strategic_partnership_price ||
          data.discount_percent ||
          data.save_amount) && (
          <div className="mt-4 rounded-xl border border-blue-400/50 bg-blue-950/40 p-4">
            <p className="text-sm font-bold uppercase text-blue-200">
              Strategic Partnership Package
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-extrabold text-white">
                {data.strategic_partnership_price || "—"}
              </p>
              {data.discount_percent && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900">
                  {data.discount_percent}% Off
                </span>
              )}
            </div>
            {data.save_amount && (
              <p className="mt-1 text-xs text-blue-200">
                Save {data.save_amount}
              </p>
            )}
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
