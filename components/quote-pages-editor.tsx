"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  QuotePage,
  QuotePageType,
  PackageDetailData,
  PricingOverviewData,
  NextStepsData,
  getQuotePages,
  createQuotePage,
  deleteQuotePage,
} from "@/lib/crm/quote-pages";

interface QuotePagesEditorProps {
  quoteId: string;
  // Gọi lại mỗi khi danh sách trang thay đổi (thêm/xóa) — dùng để
  // trang cha (VD: live preview) tự refresh mà không cần reload.
  onPagesChange?: (pages: QuotePage[]) => void;
}

const PAGE_TYPE_LABELS: Record<QuotePageType, string> = {
  custom: "Custom Page (free text)",
  package_detail: "Package Detail (objective, deliverables, timeline, price)",
  pricing_overview: "Pricing Overview (package list + partnership rate)",
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
};

const EMPTY_NEXT_STEPS: NextStepsData = {
  list_style: "numbered",
  items: [""],
  closing_note: "",
};

// Cho nhân viên tự thêm các trang nội dung riêng cho từng quote,
// theo đúng bố cục template STAFF United (Package Detail / Pricing
// Overview / Next Steps) hoặc trang tự do (Custom) — nằm trong
// flipbook, sau trang Services, trước các trang tĩnh chung.
export function QuotePagesEditor({
  quoteId,
  onPagesChange,
}: QuotePagesEditorProps) {
  const [pages, setPages] = useState<QuotePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageType, setPageType] = useState<QuotePageType>("package_detail");

  // ---- state chung cho mọi loại trang ----
  const [title, setTitle] = useState("");

  // ---- state riêng: Custom ----
  const [content, setContent] = useState("");

  // ---- state riêng: Package Detail ----
  const [packageDetail, setPackageDetail] =
    useState<PackageDetailData>(EMPTY_PACKAGE_DETAIL);

  // ---- state riêng: Pricing Overview ----
  const [pricingOverview, setPricingOverview] = useState<PricingOverviewData>(
    EMPTY_PRICING_OVERVIEW,
  );

  // ---- state riêng: Next Steps ----
  const [nextSteps, setNextSteps] = useState<NextStepsData>(EMPTY_NEXT_STEPS);

  async function loadPages() {
    const data = await getQuotePages(quoteId);
    setPages(data);
    setLoading(false);
    onPagesChange?.(data);
  }

  useEffect(() => {
    loadPages();
  }, [quoteId]);

  function resetForm() {
    setTitle("");
    setContent("");
    setPackageDetail(EMPTY_PACKAGE_DETAIL);
    setPricingOverview(EMPTY_PRICING_OVERVIEW);
    setNextSteps(EMPTY_NEXT_STEPS);
  }

  async function handleAdd() {
    if (!title.trim()) {
      toast.warning("Please enter a page title.");
      return;
    }

    if (pageType === "custom" && !content.trim()) {
      toast.warning("Please enter page content.");
      return;
    }

    if (pageType === "package_detail") {
      const filledDeliverables = packageDetail.deliverables.filter((d) =>
        d.trim(),
      );
      if (!packageDetail.strategic_objective.trim()) {
        toast.warning("Please enter the strategic objective.");
        return;
      }
      if (filledDeliverables.length === 0) {
        toast.warning("Please add at least one deliverable.");
        return;
      }
    }

    if (pageType === "pricing_overview") {
      const filledPackages = pricingOverview.packages.filter(
        (p) => p.title.trim() && p.price.trim(),
      );
      if (filledPackages.length === 0) {
        toast.warning("Please add at least one package with a price.");
        return;
      }
    }

    if (pageType === "next_steps") {
      const filledItems = nextSteps.items.filter((i) => i.trim());
      if (filledItems.length === 0) {
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
      } else if (pageType === "pricing_overview") {
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

      await createQuotePage({
        quote_id: quoteId,
        title: title.trim(),
        content: pageType === "custom" ? content.trim() : "",
        sort_order: pages.length,
        page_type: pageType,
        structured_data,
      });

      resetForm();
      await loadPages();
      toast.success("Page added to proposal.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add page.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteQuotePage(id);
      await loadPages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete page.");
    }
  }

  // ---- helpers: Package Detail deliverables list ----
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

  // ---- helpers: Pricing Overview package list ----
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

  // ---- helpers: Next Steps items list ----
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Proposal Pages
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Add pages that follow the STAFF United template — Package Detail,
        Pricing Overview, and a Next Steps closing page — or a free-text Custom
        page. These appear in the flipbook after the cover page.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {pages.length > 0 && (
            <div className="mb-4 space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {page.title}
                      </p>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {page.page_type === "package_detail"
                          ? "Package Detail"
                          : page.page_type === "pricing_overview"
                            ? "Pricing Overview"
                            : page.page_type === "next_steps"
                              ? "Next Steps"
                              : "Custom"}
                      </span>
                    </div>
                    {page.page_type === "custom" && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                        {page.content}
                      </p>
                    )}
                    {page.page_type === "package_detail" && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {(page.structured_data as unknown as PackageDetailData)
                          .deliverables?.length ?? 0}{" "}
                        deliverables · Timeline:{" "}
                        {
                          (page.structured_data as unknown as PackageDetailData)
                            .timeline
                        }
                      </p>
                    )}
                    {page.page_type === "pricing_overview" && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {(
                          page.structured_data as unknown as PricingOverviewData
                        ).packages?.length ?? 0}{" "}
                        packages listed
                      </p>
                    )}
                    {page.page_type === "next_steps" && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {(page.structured_data as unknown as NextStepsData)
                          .items?.length ?? 0}{" "}
                        steps ·{" "}
                        {(page.structured_data as unknown as NextStepsData)
                          .list_style === "bullet"
                          ? "Bullet list"
                          : "Numbered list"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            {/* Chọn loại trang trước — form bên dưới đổi theo lựa chọn */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Page type
              </label>
              <select
                value={pageType}
                onChange={(e) => {
                  setPageType(e.target.value as QuotePageType);
                  resetForm();
                }}
                className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {(Object.keys(PAGE_TYPE_LABELS) as QuotePageType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {PAGE_TYPE_LABELS[type]}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Page title
              </label>
              <input
                type="text"
                placeholder={
                  pageType === "pricing_overview"
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

            {/* ---- Form: Custom ---- */}
            {pageType === "custom" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Content
                </label>
                <textarea
                  placeholder="Page content..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            )}

            {/* ---- Form: Package Detail ---- */}
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
                          onChange={(e) =>
                            updateDeliverable(index, e.target.value)
                          }
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

            {/* ---- Form: Pricing Overview ---- */}
            {pageType === "pricing_overview" && (
              <div className="space-y-3">
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
                              updatePricingPackage(
                                index,
                                "title",
                                e.target.value,
                              )
                            }
                            className="flex-1 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                          />
                          <input
                            type="text"
                            placeholder="Price"
                            value={p.price}
                            onChange={(e) =>
                              updatePricingPackage(
                                index,
                                "price",
                                e.target.value,
                              )
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
                          placeholder="Short description of what's included..."
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

            {/* ---- Form: Next Steps ---- */}
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
                        setNextSteps((prev) => ({
                          ...prev,
                          list_style: "bullet",
                        }))
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
                          placeholder={`Step ${index + 1} (e.g. Review and confirm the proposal.)`}
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

            <Button
              onClick={handleAdd}
              disabled={saving}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-1 h-4 w-4" />
              {saving ? "Adding..." : "Add Page"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
