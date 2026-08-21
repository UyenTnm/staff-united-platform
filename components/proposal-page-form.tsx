"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  QuotePage,
  QuotePageType,
  PackageDetailData,
  PricingOverviewData,
  NextStepsData,
  createQuotePage,
  updateQuotePage,
  uploadPricingPageImage,
} from "@/lib/crm/quote-pages";

import {
  PackageDetailPage,
  PricingOverviewPage,
  PartnershipSummaryPage,
  NextStepsPage,
  ContentPage,
} from "@/components/proposal-pages";

interface ProposalPageFormProps {
  quoteId: string;
  // Truyền vào khi SỬA 1 trang đã có (từ nút bút chì ở Review).
  // Để trống khi THÊM trang mới.
  existingPage?: QuotePage | null;
  nextSortOrder: number;
  headingFontCss: string;
  onSaved: (page: QuotePage) => void;
  onCancel: () => void;
}

const PAGE_TYPE_LABELS: Record<QuotePageType, string> = {
  custom: "Custom Page (free text)",
  package_detail: "Package Detail (objective, deliverables, timeline, price)",
  pricing_overview: "Pricing Overview (package list + partnership rate)",
  partnership_summary:
    "Strategic Partnership Summary (individual packages + preferred rate)",
  next_steps: "Next Steps (closing page with numbered/bullet list)",
};

const EMPTY_PACKAGE_DETAIL: PackageDetailData = {
  strategic_objective: "",
  deliverables: [""],
  timeline: "",
  price: "",
};

const EMPTY_PRICING_OVERVIEW: PricingOverviewData = {
  packages: [{ title: "", description: "", price: "" }],
  strategic_partnership_price: "",
  discount_percent: "",
  save_amount: "",
  payment_terms: [""],
  image_url: "",
};

const EMPTY_NEXT_STEPS: NextStepsData = {
  list_style: "numbered",
  items: [""],
  closing_note: "",
};

// Form soạn 1 trang (Package Detail / Pricing Overview /
// Partnership Summary / Next Steps / Custom) kèm preview đơn ngay
// bên cạnh, cập nhật theo thời gian thực khi sale gõ — dùng cho cả
// "thêm trang mới" (ProposalWizard bước Add Page) lẫn "sửa trang đã
// có" (bấm bút chì từ bước Review).
//
// LƯU Ý: Pricing Overview / Partnership Summary dùng chung 1 form
// (packages[] nhập tay) — KHÔNG tự tính từ quote_items (Service
// Options ở trang Quote chi tiết là mục đích khác: tính giá thanh
// toán thật, không phải nội dung hiển thị trên proposal).
export function ProposalPageForm({
  quoteId,
  existingPage,
  nextSortOrder,
  headingFontCss,
  onSaved,
  onCancel,
}: ProposalPageFormProps) {
  const isEditing = !!existingPage;

  const [pageType, setPageType] = useState<QuotePageType>(
    existingPage?.page_type ?? "package_detail",
  );
  const [title, setTitle] = useState(existingPage?.title ?? "");
  const [content, setContent] = useState(
    existingPage?.page_type === "custom" ? existingPage.content : "",
  );
  const [packageDetail, setPackageDetail] = useState<PackageDetailData>(
    existingPage?.page_type === "package_detail"
      ? (existingPage.structured_data as unknown as PackageDetailData)
      : EMPTY_PACKAGE_DETAIL,
  );
  const [pricingOverview, setPricingOverview] = useState<PricingOverviewData>(
    existingPage?.page_type === "pricing_overview" ||
      existingPage?.page_type === "partnership_summary"
      ? (existingPage.structured_data as unknown as PricingOverviewData)
      : EMPTY_PRICING_OVERVIEW,
  );
  const [nextSteps, setNextSteps] = useState<NextStepsData>(
    existingPage?.page_type === "next_steps"
      ? (existingPage.structured_data as unknown as NextStepsData)
      : EMPTY_NEXT_STEPS,
  );
  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const isPricingLike =
    pageType === "pricing_overview" || pageType === "partnership_summary";

  // Nếu chuyển sang sửa 1 trang khác (existingPage đổi id), nạp lại
  // toàn bộ state theo đúng trang mới đó.
  useEffect(() => {
    if (!existingPage) return;
    setPageType(existingPage.page_type);
    setTitle(existingPage.title);
    setContent(existingPage.page_type === "custom" ? existingPage.content : "");
    setPackageDetail(
      existingPage.page_type === "package_detail"
        ? (existingPage.structured_data as unknown as PackageDetailData)
        : EMPTY_PACKAGE_DETAIL,
    );
    setPricingOverview(
      existingPage.page_type === "pricing_overview" ||
        existingPage.page_type === "partnership_summary"
        ? (existingPage.structured_data as unknown as PricingOverviewData)
        : EMPTY_PRICING_OVERVIEW,
    );
    setNextSteps(
      existingPage.page_type === "next_steps"
        ? (existingPage.structured_data as unknown as NextStepsData)
        : EMPTY_NEXT_STEPS,
    );
  }, [existingPage?.id]);

  async function handlePricingImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file.");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadPricingPageImage(quoteId, file);
      setPricingOverview((prev) => ({ ...prev, image_url: url }));
      toast.success("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.warning("Please enter a page title.");
      return;
    }
    if (pageType === "custom" && !content.trim()) {
      toast.warning("Please enter page content.");
      return;
    }
    if (pageType === "package_detail") {
      const filled = packageDetail.deliverables.filter((d) => d.trim());
      if (!packageDetail.strategic_objective.trim() || filled.length === 0) {
        toast.warning(
          "Please enter the strategic objective and at least one deliverable.",
        );
        return;
      }
    }
    if (isPricingLike) {
      const filled = pricingOverview.packages.filter(
        (p) => p.title.trim() && p.price.trim(),
      );
      if (filled.length === 0) {
        toast.warning("Please add at least one package with a price.");
        return;
      }
    }
    if (pageType === "next_steps") {
      const filled = nextSteps.items.filter((i) => i.trim());
      if (filled.length === 0) {
        toast.warning("Please add at least one step.");
        return;
      }
    }

    setSaving(true);
    try {
      let structured_data: Record<string, unknown> = {};
      if (pageType === "package_detail") {
        structured_data = {
          ...packageDetail,
          deliverables: packageDetail.deliverables.filter((d) => d.trim()),
        };
      } else if (isPricingLike) {
        structured_data = {
          ...pricingOverview,
          packages: pricingOverview.packages.filter(
            (p) => p.title.trim() && p.price.trim(),
          ),
        };
      } else if (pageType === "next_steps") {
        structured_data = {
          ...nextSteps,
          items: nextSteps.items.filter((i) => i.trim()),
        };
      }

      if (isEditing && existingPage) {
        await updateQuotePage(existingPage.id, {
          title: title.trim(),
          content: pageType === "custom" ? content.trim() : "",
          structured_data,
        });
        toast.success("Page updated.");
        onSaved({
          ...existingPage,
          title: title.trim(),
          content: pageType === "custom" ? content.trim() : "",
          structured_data,
        });
      } else {
        const created = await createQuotePage({
          quote_id: quoteId,
          title: title.trim(),
          content: pageType === "custom" ? content.trim() : "",
          sort_order: nextSortOrder,
          page_type: pageType,
          structured_data,
        });
        toast.success("Page added.");
        onSaved(created);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save page.");
    } finally {
      setSaving(false);
    }
  }

  // ---- helpers: Package Detail ----
  function updateDeliverable(index: number, value: string) {
    setPackageDetail((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => (i === index ? value : d)),
    }));
  }
  function addDeliverable() {
    setPackageDetail((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, ""],
    }));
  }
  function removeDeliverable(index: number) {
    setPackageDetail((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  }

  // ---- helpers: Pricing Overview / Partnership Summary ----
  function updatePricingPackage(
    index: number,
    field: "title" | "description" | "price",
    value: string,
  ) {
    setPricingOverview((prev) => ({
      ...prev,
      packages: prev.packages.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  }
  function addPricingPackage() {
    setPricingOverview((prev) => ({
      ...prev,
      packages: [...prev.packages, { title: "", description: "", price: "" }],
    }));
  }
  function removePricingPackage(index: number) {
    setPricingOverview((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  }

  // ---- helpers: Next Steps ----
  function updateNextStepItem(index: number, value: string) {
    setNextSteps((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? value : it)),
    }));
  }
  function addNextStepItem() {
    setNextSteps((prev) => ({ ...prev, items: [...prev.items, ""] }));
  }
  function removeNextStepItem(index: number) {
    setNextSteps((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ---- FORM ---- */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Page type
          </label>
          <select
            value={pageType}
            disabled={isEditing}
            onChange={(e) => setPageType(e.target.value as QuotePageType)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
          >
            {(Object.keys(PAGE_TYPE_LABELS) as QuotePageType[]).map((type) => (
              <option key={type} value={type}>
                {PAGE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {isEditing && (
            <p className="mt-1 text-[11px] text-slate-400">
              Page type can&apos;t be changed after creation. Delete and re-add
              if needed.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Page title
          </label>
          <input
            type="text"
            placeholder={
              isPricingLike
                ? "e.g. Proposal & Pricing"
                : pageType === "next_steps"
                  ? "e.g. Next Steps to Begin This Partnership"
                  : "e.g. Marketing & Branding Package"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {pageType === "custom" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Content
            </label>
            <textarea
              placeholder="Page content..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        )}

        {pageType === "package_detail" && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Strategic objective
              </label>
              <textarea
                placeholder="Describe the goal of this package..."
                rows={3}
                value={packageDetail.strategic_objective}
                onChange={(e) =>
                  setPackageDetail((prev) => ({
                    ...prev,
                    strategic_objective: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Key deliverables
              </label>
              <div className="space-y-2">
                {packageDetail.deliverables.map((d, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Deliverable ${index + 1}`}
                      value={d}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    {packageDetail.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addDeliverable}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add deliverable
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Timeline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 – 8 weeks"
                  value={packageDetail.timeline}
                  onChange={(e) =>
                    setPackageDetail((prev) => ({
                      ...prev,
                      timeline: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25,000,000 VND"
                  value={packageDetail.price}
                  onChange={(e) =>
                    setPackageDetail((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {isPricingLike && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Company / cover image for this page (optional)
              </label>
              {pricingOverview.image_url && (
                <div className="mb-2 overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pricingOverview.image_url}
                    alt=""
                    className="h-24 w-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePricingImageUpload}
                disabled={uploadingImage}
                className="text-sm"
              />
              {uploadingImage && (
                <p className="mt-1 text-xs text-slate-400">Uploading...</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Packages
              </label>
              <div className="space-y-3">
                {pricingOverview.packages.map((p, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Package title"
                        value={p.title}
                        onChange={(e) =>
                          updatePricingPackage(index, "title", e.target.value)
                        }
                        className="flex-1 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        value={p.price}
                        onChange={(e) =>
                          updatePricingPackage(index, "price", e.target.value)
                        }
                        className="w-32 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                      {pricingOverview.packages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePricingPackage(index)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Short description (optional)"
                      value={p.description}
                      onChange={(e) =>
                        updatePricingPackage(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPricingPackage}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add package
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Strategic Partnership Package (bundle discount)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Bundle price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 80,000,000 VND"
                    value={pricingOverview.strategic_partnership_price}
                    onChange={(e) =>
                      setPricingOverview((prev) => ({
                        ...prev,
                        strategic_partnership_price: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Discount %
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15"
                    value={pricingOverview.discount_percent}
                    onChange={(e) =>
                      setPricingOverview((prev) => ({
                        ...prev,
                        discount_percent: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Save amount
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12,000,000 VND"
                    value={pricingOverview.save_amount}
                    onChange={(e) =>
                      setPricingOverview((prev) => ({
                        ...prev,
                        save_amount: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {pageType === "next_steps" && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                List style
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setNextSteps((prev) => ({
                      ...prev,
                      list_style: "numbered",
                    }))
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    nextSteps.list_style === "numbered"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  1. 2. 3. Numbered
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNextSteps((prev) => ({ ...prev, list_style: "bullet" }))
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    nextSteps.list_style === "bullet"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  • Bullet points
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Steps
              </label>
              <div className="space-y-2">
                {nextSteps.items.map((it, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 flex-shrink-0 text-xs text-slate-400">
                      {nextSteps.list_style === "numbered"
                        ? `${index + 1}.`
                        : "•"}
                    </span>
                    <input
                      type="text"
                      placeholder={`Step ${index + 1}`}
                      value={it}
                      onChange={(e) =>
                        updateNextStepItem(index, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    {nextSteps.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNextStepItem(index)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addNextStepItem}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add step
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Closing note (optional)
              </label>
              <textarea
                placeholder="e.g. We look forward to supporting your team in..."
                rows={3}
                value={nextSteps.closing_note}
                onChange={(e) =>
                  setNextSteps((prev) => ({
                    ...prev,
                    closing_note: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 cursor-pointer"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Page"}
          </Button>
          <Button
            onClick={onCancel}
            disabled={saving}
            variant="outline"
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* ---- PREVIEW ĐƠN — cập nhật ngay khi gõ ---- */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-3 text-center text-sm font-medium text-slate-500">
          Preview
        </p>
        <div
          className="mx-auto overflow-hidden rounded-xl shadow-2xl"
          style={{ width: 320, height: 448 }}
        >
          {pageType === "package_detail" && (
            <PackageDetailPage
              title={title}
              data={packageDetail}
              pageNumber="01"
              headingFontCss={headingFontCss}
            />
          )}
          {pageType === "pricing_overview" && (
            <PricingOverviewPage
              title={title || "Proposal & Pricing"}
              data={pricingOverview}
              headingFontCss={headingFontCss}
            />
          )}
          {pageType === "partnership_summary" && (
            <PartnershipSummaryPage
              data={pricingOverview}
              headingFontCss={headingFontCss}
            />
          )}
          {pageType === "next_steps" && (
            <NextStepsPage
              title={title || "Next Steps"}
              data={nextSteps}
              headingFontCss={headingFontCss}
            />
          )}
          {pageType === "custom" && (
            <ContentPage
              title={title || "Page Title"}
              content={content || "Your content will appear here..."}
              headingFontCss={headingFontCss}
            />
          )}
        </div>
      </div>
    </div>
  );
}
