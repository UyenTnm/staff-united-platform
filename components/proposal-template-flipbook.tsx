"use client";

import { forwardRef } from "react";
// @ts-ignore - react-pageflip không có type định nghĩa đầy đủ
import HTMLFlipBookRaw from "react-pageflip";
import { QuoteItem, getItemTotal } from "@/lib/crm/quote-items";
import { QuotePage } from "@/lib/crm/quote-pages";
import { STATIC_PAGES } from "@/lib/proposal-static-pages";

const HTMLFlipBook = HTMLFlipBookRaw as any;

interface ProposalTemplateFlipbookProps {
  companyName: string;
  contactName: string;
  proposalTitle: string;
  clientLogoUrl: string | null;
  mandatoryItems: QuoteItem[];
  currencySymbol: string;
  customPages: QuotePage[];
}

const ITEMS_PER_SERVICE_PAGE = 5;

// ---- Trang bìa ----
const CoverPage = forwardRef<
  HTMLDivElement,
  {
    companyName: string;
    contactName: string;
    title: string;
    logoUrl: string | null;
  }
>(({ companyName, contactName, title, logoUrl }, ref) => {
  return (
    <div
      ref={ref}
      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-10 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
        Proposal
      </p>

      {logoUrl ? (
        <div className="my-8 flex h-24 items-center justify-center rounded-xl bg-white/95 px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={companyName}
            className="h-16 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="my-8 flex h-24 items-center justify-center">
          <p className="text-3xl font-bold text-white">{companyName}</p>
        </div>
      )}

      <h1 className="mt-4 text-2xl font-bold leading-tight text-white">
        {title}
      </h1>

      <p className="mt-4 text-sm text-slate-300">Prepared for {contactName}</p>

      <div className="mt-10 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-px w-8 bg-slate-600" />
        Prepared by STAFF United
        <span className="h-px w-8 bg-slate-600" />
      </div>
    </div>
  );
});
CoverPage.displayName = "CoverPage";

// ---- Trang dịch vụ (1 nhóm, tối đa 5 hạng mục/trang) ----
const ServicesPage = forwardRef<
  HTMLDivElement,
  {
    items: QuoteItem[];
    currencySymbol: string;
    pageLabel: string;
  }
>(({ items, currencySymbol, pageLabel }, ref) => {
  return (
    <div ref={ref} className="flex h-full w-full flex-col bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
        What&apos;s Included {pageLabel}
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">
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
              <p className="whitespace-nowrap font-semibold text-emerald-700">
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

// ---- Trang nội dung chung (dùng cho cả Custom Page và Static Page) ----
const ContentPage = forwardRef<
  HTMLDivElement,
  { title: string; content: string }
>(({ title, content }, ref) => {
  return (
    <div ref={ref} className="flex h-full w-full flex-col bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
        STAFF United
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">{title}</h2>

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

// ============================================================
// Ghép toàn bộ trang theo đúng thứ tự:
// Cover → Services (tự chia nhóm 5 dịch vụ/trang) → Custom Pages
// (nhân viên tự thêm riêng cho quote này) → Static Pages (About Us /
// Why Choose Us / Terms — dùng chung mọi proposal).
// ============================================================
export function ProposalTemplateFlipbook({
  companyName,
  contactName,
  proposalTitle,
  clientLogoUrl,
  mandatoryItems,
  currencySymbol,
  customPages,
}: ProposalTemplateFlipbookProps) {
  // Chia mandatoryItems thành từng nhóm tối đa 5 items/trang
  const serviceChunks: QuoteItem[][] = [];
  for (let i = 0; i < mandatoryItems.length; i += ITEMS_PER_SERVICE_PAGE) {
    serviceChunks.push(mandatoryItems.slice(i, i + ITEMS_PER_SERVICE_PAGE));
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="mx-auto" style={{ maxWidth: 420 }}>
        <HTMLFlipBook
          width={400}
          height={560}
          size="fixed"
          showCover={true}
          mobileScrollSupport={true}
          className="shadow-2xl"
        >
          <CoverPage
            companyName={companyName}
            contactName={contactName}
            title={proposalTitle}
            logoUrl={clientLogoUrl}
          />

          {serviceChunks.map((chunk, index) => (
            <ServicesPage
              key={`service-${index}`}
              items={chunk}
              currencySymbol={currencySymbol}
              pageLabel={
                serviceChunks.length > 1
                  ? `(${index + 1}/${serviceChunks.length})`
                  : ""
              }
            />
          ))}

          {customPages.map((page) => (
            <ContentPage
              key={page.id}
              title={page.title}
              content={page.content}
            />
          ))}

          {STATIC_PAGES.map((page, index) => (
            <ContentPage
              key={`static-${index}`}
              title={page.title}
              content={page.content}
            />
          ))}
        </HTMLFlipBook>
      </div>

      <p className="text-xs text-slate-400">
        Click or drag the corner of the page to flip
      </p>
    </div>
  );
}
