"use client";

import { useEffect } from "react";
// @ts-ignore - react-pageflip không có type định nghĩa đầy đủ
import HTMLFlipBookRaw from "react-pageflip";
import { QuoteItem } from "@/lib/crm/quote-items";
import {
  QuotePage,
  PackageDetailData,
  PricingOverviewData,
  NextStepsData,
} from "@/lib/crm/quote-pages";
import {
  CoverPage,
  ServicesPage,
  PackageDetailPage,
  PricingOverviewPage,
  NextStepsPage,
  ContentPage,
} from "@/components/proposal-pages";
import {
  HEADING_FONTS,
  BODY_FONTS,
  findFont,
  buildGoogleFontsHref,
} from "@/lib/proposal-fonts";

const HTMLFlipBook = HTMLFlipBookRaw as any;

interface ProposalTemplateFlipbookProps {
  companyName: string;
  contactName: string;
  proposalTitle: string;
  clientLogoUrl: string | null;
  coverImageUrl?: string | null;
  fontHeading?: string | null;
  fontBody?: string | null;
  mandatoryItems: QuoteItem[];
  currencySymbol: string;
  customPages: QuotePage[];
  // Có 2 callback này => đang ở chế độ REVIEW (trong ProposalWizard),
  // mỗi trang hiện nút bút chì để nhảy thẳng về sửa trang đó.
  // Không truyền => chế độ xem thuần (khách xem /proposal/[token]),
  // không có nút sửa nào cả.
  onEditCover?: () => void;
  onEditPage?: (pageId: string) => void;
}

const ITEMS_PER_SERVICE_PAGE = 5;

// ---- Hook: nạp font Google đã chọn vào trang ----
function useGoogleFonts(headingValue: string, bodyValue: string) {
  useEffect(() => {
    const heading = findFont(HEADING_FONTS, headingValue);
    const body = findFont(BODY_FONTS, bodyValue);
    const href = buildGoogleFontsHref([heading, body]);
    const id = "proposal-google-fonts";

    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) {
      link.href = href;
    }
  }, [headingValue, bodyValue]);
}

// ============================================================
// Trình xem TỔNG THỂ dạng flipbook — chỉ dùng ở:
// (a) Bước Review cuối cùng của ProposalWizard (truyền onEditCover/
//     onEditPage để hiện nút bút chì từng trang), hoặc
// (b) Trang public /proposal/[token] (không truyền 2 callback trên,
//     khách chỉ xem, không sửa được gì).
//
// KHÔNG tự động chèn About Us/Why Choose Us/Terms — không có trong
// mẫu thiết kế gốc. Sale muốn nội dung tương tự thì tự thêm bằng
// loại trang "Custom".
// ============================================================
export function ProposalTemplateFlipbook({
  companyName,
  contactName,
  proposalTitle,
  clientLogoUrl,
  coverImageUrl,
  fontHeading,
  fontBody,
  mandatoryItems,
  currencySymbol,
  customPages,
  onEditCover,
  onEditPage,
}: ProposalTemplateFlipbookProps) {
  const headingFont = findFont(HEADING_FONTS, fontHeading);
  const bodyFont = findFont(BODY_FONTS, fontBody);

  useGoogleFonts(headingFont.value, bodyFont.value);

  const serviceChunks: QuoteItem[][] = [];
  for (let i = 0; i < mandatoryItems.length; i += ITEMS_PER_SERVICE_PAGE) {
    serviceChunks.push(mandatoryItems.slice(i, i + ITEMS_PER_SERVICE_PAGE));
  }

  const packageTitles = mandatoryItems.map((i) => i.service_name);

  let packageDetailCount = 0;

  return (
    <div
      className="flex flex-col items-center gap-3"
      style={{ fontFamily: bodyFont.cssName }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
        <HTMLFlipBook
          width={400}
          height={566}
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
            coverImageUrl={coverImageUrl ?? null}
            packageTitles={packageTitles}
            headingFontCss={headingFont.cssName}
            onEdit={onEditCover}
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
              headingFontCss={headingFont.cssName}
            />
          ))}

          {customPages.map((page) => {
            const onEdit = onEditPage ? () => onEditPage(page.id) : undefined;

            if (page.page_type === "package_detail") {
              packageDetailCount += 1;
              return (
                <PackageDetailPage
                  key={page.id}
                  title={page.title}
                  data={page.structured_data as unknown as PackageDetailData}
                  pageNumber={String(packageDetailCount).padStart(2, "0")}
                  headingFontCss={headingFont.cssName}
                  onEdit={onEdit}
                />
              );
            }
            if (page.page_type === "pricing_overview") {
              return (
                <PricingOverviewPage
                  key={page.id}
                  title={page.title}
                  items={mandatoryItems}
                  data={page.structured_data as unknown as PricingOverviewData}
                  currencySymbol={currencySymbol}
                  headingFontCss={headingFont.cssName}
                  onEdit={onEdit}
                />
              );
            }
            if (page.page_type === "next_steps") {
              return (
                <NextStepsPage
                  key={page.id}
                  title={page.title}
                  data={page.structured_data as unknown as NextStepsData}
                  headingFontCss={headingFont.cssName}
                  onEdit={onEdit}
                />
              );
            }
            return (
              <ContentPage
                key={page.id}
                title={page.title}
                content={page.content}
                headingFontCss={headingFont.cssName}
                onEdit={onEdit}
              />
            );
          })}
        </HTMLFlipBook>
      </div>

      <p className="text-xs text-slate-400">
        {onEditCover
          ? "Click the pencil icon on any page to edit it. Drag or click the corner to flip pages."
          : "Click or drag the corner of the page to flip"}
      </p>
    </div>
  );
}
