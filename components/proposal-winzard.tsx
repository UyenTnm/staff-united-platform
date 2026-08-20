"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Pencil, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ClientLogoUpload } from "@/components/client-logo-upload";
import { CoverImageUpload } from "@/components/cover-image-upload";
import { FontPicker } from "@/components/font-picker";
import { ProposalPageForm } from "@/components/proposal-page-form";
import { ProposalTemplateFlipbook } from "@/components/proposal-template-flipbook";
import { CoverPage } from "@/components/proposal-pages";

import { Quote } from "@/lib/crm/quotes";
import { QuoteItem } from "@/lib/crm/quote-items";
import {
  QuotePage,
  getQuotePages,
  deleteQuotePage,
} from "@/lib/crm/quote-pages";
import { HEADING_FONTS, findFont } from "@/lib/proposal-fonts";

type WizardMode = "cover" | "list" | "page-form" | "review";

const PAGE_TYPE_LABELS: Record<string, string> = {
  package_detail: "Package Detail",
  pricing_overview: "Pricing Overview",
  next_steps: "Next Steps",
  custom: "Custom",
};

interface ProposalWizardProps {
  quote: Quote;
  items: QuoteItem[];
  onQuoteRefresh: () => void | Promise<void>;
}

// ============================================================
// Bộ điều phối chính — luồng step-by-step thay cho form + live
// preview toàn bộ như trước:
//
//   cover  → list (danh sách trang) → page-form (thêm/sửa 1 trang)
//                                    → review (flipbook tổng thể,
//                                      bấm bút chì trên từng trang để
//                                      nhảy thẳng về sửa trang đó)
//
// Trang bìa (cover) luôn có thể quay lại sửa bất cứ lúc nào, từ
// "list" hoặc từ nút bút chì trên chính trang bìa ở "review".
// ============================================================
export function ProposalWizard({
  quote,
  items,
  onQuoteRefresh,
}: ProposalWizardProps) {
  const [mode, setMode] = useState<WizardMode>("cover");
  const [pages, setPages] = useState<QuotePage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [editingPage, setEditingPage] = useState<QuotePage | null>(null);

  async function loadPages() {
    const data = await getQuotePages(quote.id);
    setPages(data);
    setLoadingPages(false);
  }

  useEffect(() => {
    loadPages();
  }, [quote.id]);

  async function handleDeletePage(id: string) {
    try {
      await deleteQuotePage(id);
      await loadPages();
      toast.success("Page deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete page.");
    }
  }

  function handleReviewClick() {
    if (pages.length === 0) {
      toast.warning("Add at least one page before reviewing.");
      return;
    }
    setMode("review");
  }

  const mandatoryItems = items.filter((i) => !i.is_optional);
  // Package Title trên trang bìa lấy từ các trang "Package Detail" mà
  // sale đã thêm ở Bước 2 (List) — KHÔNG lấy từ quote_items (đó là
  // Service Options ở trang Quote chi tiết, dùng để tính giá, khác
  // mục đích). Nhờ vậy sale chỉ cần thêm Package Detail trong Wizard
  // là trang bìa tự cập nhật theo, không cần vào chỗ khác.
  const packageTitles = pages
    .filter((p) => p.page_type === "package_detail")
    .map((p) => p.title);
  const headingFont = findFont(HEADING_FONTS, quote.font_heading);
  const isVietnamMarket = quote.customer_market === "vietnam";
  const currencySymbol = isVietnamMarket ? "₫" : "$";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link
          href={`/crm/quotes/${quote.id}`}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quote
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create Proposal with STAFF United Template
        </h1>
        <p className="mt-1 text-slate-500">
          {quote.quote_number} — {quote.company_name}
        </p>
      </div>

      {/* ---- Step indicator ---- */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {(
          [
            ["cover", "1. Cover Page"],
            ["list", "2. Content Pages"],
            ["review", "3. Final Review"],
          ] as const
        ).map(([key, label], i) => {
          const active =
            mode === key || (key === "list" && mode === "page-form");
          return (
            <div key={key} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-300">→</span>}
              <span
                className={
                  active
                    ? "rounded-full bg-blue-600 px-3 py-1 text-white"
                    : "rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800"
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ============ MODE: COVER ============ */}
      {mode === "cover" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <ClientLogoUpload
              quoteId={quote.id}
              currentLogoUrl={quote.client_logo_url}
              onUploaded={onQuoteRefresh}
            />
            <CoverImageUpload
              quoteId={quote.id}
              currentImageUrl={quote.cover_image_url}
              onUploaded={onQuoteRefresh}
            />
            <FontPicker
              quoteId={quote.id}
              currentHeadingFont={quote.font_heading}
              currentBodyFont={quote.font_body}
              onSaved={onQuoteRefresh}
            />
            <Button onClick={() => setMode("list")} className="w-full">
              Continue to Content Pages →
            </Button>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-3 text-center text-sm font-medium text-slate-500">
              Cover Preview
            </p>
            <div
              className="mx-auto overflow-hidden rounded-xl shadow-2xl"
              style={{ width: 320, height: 448 }}
            >
              <CoverPage
                companyName={quote.company_name}
                contactName={quote.contact_name}
                title={quote.title}
                logoUrl={quote.client_logo_url}
                coverImageUrl={quote.cover_image_url}
                packageTitles={packageTitles}
                headingFontCss={headingFont.cssName}
                editable
                quoteId={quote.id}
                onCoverImageUploaded={onQuoteRefresh}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============ MODE: LIST (danh sách trang) ============ */}
      {mode === "list" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setMode("cover")}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
                <ImageIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Cover Page
                </p>
                <p className="text-xs text-slate-500">
                  Logo, cover image, fonts
                </p>
              </div>
            </div>
            <Pencil className="h-4 w-4 text-slate-400" />
          </button>

          {loadingPages ? (
            <p className="text-sm text-slate-400">Loading pages...</p>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPage(page);
                      setMode("page-form");
                    }}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {PAGE_TYPE_LABELS[page.page_type] ?? page.page_type}
                    </span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {page.title}
                    </p>
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPage(page);
                        setMode("page-form");
                      }}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePage(page.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingPage(null);
              setMode("page-form");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add New Page
          </button>

          <Button onClick={handleReviewClick} className="w-full">
            Review Full Proposal →
          </Button>
        </div>
      )}

      {/* ============ MODE: PAGE-FORM (thêm/sửa 1 trang) ============ */}
      {mode === "page-form" && (
        <ProposalPageForm
          quoteId={quote.id}
          existingPage={editingPage}
          nextSortOrder={pages.length}
          headingFontCss={headingFont.cssName}
          onSaved={async () => {
            await loadPages();
            setEditingPage(null);
            setMode("list");
          }}
          onCancel={() => {
            setEditingPage(null);
            setMode("list");
          }}
        />
      )}

      {/* ============ MODE: REVIEW (flipbook tổng thể) ============ */}
      {mode === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setMode("list")}>
              ← Back to Pages
            </Button>
            <Button asChild size="sm">
              <Link href={`/crm/quotes/${quote.id}`}>Done</Link>
            </Button>
          </div>

          <ProposalTemplateFlipbook
            companyName={quote.company_name}
            contactName={quote.contact_name}
            proposalTitle={quote.title}
            clientLogoUrl={quote.client_logo_url}
            coverImageUrl={quote.cover_image_url}
            fontHeading={quote.font_heading}
            fontBody={quote.font_body}
            mandatoryItems={mandatoryItems}
            currencySymbol={currencySymbol}
            customPages={pages}
            onEditCover={() => setMode("cover")}
            onEditPage={(pageId) => {
              const page = pages.find((p) => p.id === pageId) ?? null;
              setEditingPage(page);
              setMode("page-form");
            }}
          />
        </div>
      )}
    </div>
  );
}
