"use client";

import { useEffect, useState } from "react";
import CoverStep from "./steps/CoverStep";
import WizardNavigation from "./WizardNavigation";
import ProposalRenderer from "../ProposalRenderer";

import {
  CoverPageData,
  ScopePageData,
  PricingPageData,
  PartnershipPageData,
  NextStepsPageData,
} from "../types";

import ScopeStep from "./steps/ScopeStep";
import PackageStep from "./steps/PackageStep";
import PartnershipStep from "./steps/PartnershipStep";
import NextStepsStep from "./steps/NextStepsStep";

import { Quote } from "@/lib/crm/quotes";
import { QuoteItem } from "@/lib/crm/quote-items";

import {
  getQuotePages,
  createQuotePage,
  updateQuotePage,
  deleteQuotePage,
  QuotePage,
} from "@/lib/crm/quote-pages";

import { setQuoteTemplateVersion } from "@/lib/crm/quotes";

const steps = ["Cover", "Scope", "Packages", "Partnership", "Next Steps"];

interface ProposalWizardProps {
  quote: Quote;
  items: QuoteItem[];
}

export default function ProposalWizard({ quote, items }: ProposalWizardProps) {
  const [step, setStep] = useState(0);
  const [contentOverflow, setContentOverflow] = useState(false);
  const [pages, setPages] = useState<QuotePage[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadPages() {
      const existingPages = await getQuotePages(quote.id);

      setPages(existingPages);
    }

    loadPages();
  }, [quote.id]);

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  async function savePage(
    pageType:
      | "custom"
      | "pricing_overview"
      | "package_detail"
      | "partnership_summary"
      | "next_steps",
    title: string,
    structuredData: Record<string, unknown>,
    sortOrder: number,
  ) {
    const existingPage = pages.find((page) => page.page_type === pageType);

    if (existingPage) {
      await updateQuotePage(existingPage.id, {
        title,
        structured_data: structuredData,
        sort_order: sortOrder,
      });

      return existingPage;
    }

    return await createQuotePage({
      quote_id: quote.id,
      title,
      page_type: pageType,
      sort_order: sortOrder,
      structured_data: structuredData,
    });
  }

  const formatPrice = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return "0";
    }

    if (typeof value === "number") {
      return new Intl.NumberFormat("en-US").format(value);
    }

    return value;
  };

  const currency: "VND" | "USD" =
    quote.currency === "USD" ||
    quote.currency_code === "USD" ||
    quote.customer_market === "international"
      ? "USD"
      : "VND";

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);

      await setQuoteTemplateVersion(quote.id, "v2");

      await savePage(
        "custom",
        cover.proposalTitle,
        cover as unknown as Record<string, unknown>,
        0,
      );

      await savePage(
        "pricing_overview",
        scope.projectTitle,
        scope as unknown as Record<string, unknown>,
        1,
      );

      await savePage(
        "package_detail",
        pricing.packageTitle,
        pricing as unknown as Record<string, unknown>,
        2,
      );

      await savePage(
        "partnership_summary",
        partnership.packageName,
        partnership as unknown as Record<string, unknown>,
        3,
      );

      await savePage(
        "next_steps",
        "NEXT STEPS",
        nextSteps as unknown as Record<string, unknown>,
        4,
      );

      const updatedPages = await getQuotePages(quote.id);
      setPages(updatedPages);

      setSaved(true);
    } catch (error) {
      console.error("Failed to save proposal:", error);
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * COVER
   * ============================================================
   */

  const defaultProposalDetails = items
    .slice(0, 5)
    .map((item) => item.service_name)
    .filter(Boolean);

  const [cover, setCover] = useState<CoverPageData>({
    proposalTitle: quote.title || "Strategic Growth Proposal",

    proposalDetails:
      defaultProposalDetails.length > 0
        ? defaultProposalDetails
        : ["Strategic Business Partnership"],

    preparedFor: quote.company_name || "",

    preparedBy: "STAFF United",

    date: quote.created_at
      ? new Date(quote.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "",

    clientLogo: quote.client_logo_url || "",

    coverImage: quote.cover_image_url || "",

    coverPositionX: 0,
    coverPositionY: 0,
    coverScale: 1.35,
  });

  /*
   * ============================================================
   * SCOPE
   * ============================================================
   */

  const scopeServices = items.map((item) => ({
    title: item.service_name || "Service",

    description:
      item.description || "Professional service and execution support.",

    price: formatPrice(item.unit_price),
  }));

  const totalPrice = formatPrice(quote.amount);

  const [scope, setScope] = useState<ScopePageData>({
    projectTitle: quote.title || "Strategic Growth Proposal",

    services: scopeServices,

    packageName: "Strategic Partnership Package",

    totalPrice,

    originalPrice: totalPrice,

    discount: "0",

    finalPrice: totalPrice,

    currency,

    clientLogo: quote.client_logo_url || "",

    scopeImage: "",

    scopeImagePositionX: 0,

    scopeImagePositionY: 0,

    scopeImageScale: 1,

    paymentTerms: [
      "50% deposit required to initiate the project.",
      "50% final payment upon completion.",
      "Additional work will be quoted separately.",
    ],
  });

  /*
   * ============================================================
   * PRICING / PACKAGE DETAIL
   * ============================================================
   */

  const firstItem = items[0];

  const [pricing, setPricing] = useState<PricingPageData>({
    packageTitle:
      firstItem?.service_name || quote.title || "Strategic Growth Proposal",

    strategicObjective:
      "Optimise business operations and improve overall efficiency through structured execution and professional support.",

    deliverables: firstItem?.description
      ? [firstItem.description]
      : [
          "Professional service execution",
          "Process optimisation",
          "Implementation support",
          "Performance monitoring",
        ],

    timeline: "4–8 Weeks",

    price: formatPrice(firstItem?.unit_price ?? quote.amount),

    currency,

    clientLogo: quote.client_logo_url || "",
  });

  /*
   * ============================================================
   * PARTNERSHIP
   * ============================================================
   */

  const partnershipItems = items.map((item) => ({
    title: item.service_name || "Service",
    price: formatPrice(item.unit_price),
  }));

  const [partnership, setPartnership] = useState<PartnershipPageData>({
    packageName: "STRATEGIC PARTNERSHIP PACKAGE",

    individualPackages: partnershipItems,

    totalPrice,

    finalPrice: totalPrice,

    savePrice: "0",

    discount: "0",

    currency,

    paymentTerms: [
      "50% deposit required to initiate the project.",
      "50% final payment due upon completion.",
      "Additional work outside agreed scope quoted separately.",
    ],

    clientLogo: quote.client_logo_url || "",
  });

  /*
   * ============================================================
   * NEXT STEPS
   * ============================================================
   */

  const [nextSteps, setNextSteps] = useState<NextStepsPageData>({
    preparedBy: "STAFF United",

    email: quote.contact_email || "website@staffunitedgroup.com",

    nextSteps: [
      "Review and confirm the proposed scope.",
      "Approve the final package and timeline.",
      "Sign the Service Agreement.",
      "Project kickoff and onboarding session.",
    ],

    closingMessage:
      "We look forward to supporting your business in strengthening its brand visibility, professional market presence, and business development across physical and digital channels.",

    clientLogo: quote.client_logo_url || "",
  });

  useEffect(() => {
    if (pages.length === 0) return;

    const coverPage = pages.find((page) => page.page_type === "custom");

    const scopePage = pages.find(
      (page) => page.page_type === "pricing_overview",
    );

    const pricingPage = pages.find(
      (page) => page.page_type === "package_detail",
    );

    const partnershipPage = pages.find(
      (page) => page.page_type === "partnership_summary",
    );

    const nextStepsPage = pages.find((page) => page.page_type === "next_steps");

    if (coverPage?.structured_data) {
      setCover(coverPage.structured_data as unknown as CoverPageData);
    }

    if (scopePage?.structured_data) {
      setScope({
        ...(scopePage.structured_data as unknown as ScopePageData),
        currency,
      });
    }

    if (pricingPage?.structured_data) {
      setPricing({
        ...(pricingPage.structured_data as unknown as PricingPageData),
        currency,
      });
    }

    if (partnershipPage?.structured_data) {
      setPartnership({
        ...(partnershipPage.structured_data as unknown as PartnershipPageData),
        currency,
      });
    }

    if (nextStepsPage?.structured_data) {
      setNextSteps(
        nextStepsPage.structured_data as unknown as NextStepsPageData,
      );
    }
  }, [pages]);

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col overflow-hidden rounded-2xl bg-[#F4F7FB]">
      {/* ---------- HEADER ---------- */}

      <div className="border-b border-[#D5DADF] bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#4F8DC9]">
              Step {step + 1} of {steps.length}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0A1B33] font-[Poppins]">
              Custom Proposal
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#103663] px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0A294C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Proposal"}
          </button>
        </div>

        {/* Step Tabs */}

        <div className="mt-6 flex flex-wrap gap-3">
          {steps.map((item, index) => (
            <button
              key={item}
              onClick={() => setStep(index)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                step === index
                  ? "bg-[#103663] text-white shadow"
                  : "border border-[#D5DADF] bg-white text-[#4A596E] hover:border-[#4F8DC9]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- BODY ---------- */}

      <div className="grid min-h-0 flex-1 grid-cols-12 overflow-hidden">
        {/* LEFT : FORM */}

        <div className="col-span-5 flex min-h-0 flex-col border-r border-[#D5DADF] bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto p-8">
            {step === 0 && <CoverStep data={cover} onChange={setCover} />}

            {step === 1 && <ScopeStep data={scope} onChange={setScope} />}

            {step === 2 && (
              <PackageStep
                data={pricing}
                onChange={setPricing}
                contentOverflow={contentOverflow}
              />
            )}

            {step === 3 && (
              <PartnershipStep data={partnership} onChange={setPartnership} />
            )}

            {step === 4 && (
              <NextStepsStep data={nextSteps} onChange={setNextSteps} />
            )}
          </div>

          <WizardNavigation
            currentStep={step}
            totalSteps={steps.length}
            onPrevious={() => setStep(Math.max(step - 1, 0))}
            onNext={() => setStep(Math.min(step + 1, steps.length - 1))}
          />
        </div>

        {/* RIGHT : FLIPBOOK PREVIEW */}

        <div className="col-span-7 overflow-auto bg-[#E9EEF4]">
          <div className="flex justify-center p-6">
            <div className="rounded-xl border border-[#D5DADF] bg-white p-3 shadow-lg">
              <div
                className="origin-top-left overflow-hidden rounded-lg"
                style={{
                  width: 315,
                  height: 446,
                }}
              >
                <div
                  style={{
                    transform: "scale(0.397)",
                    transformOrigin: "top left",
                    width: 794,
                    height: 1123,
                  }}
                >
                  <ProposalRenderer
                    cover={cover}
                    scope={scope}
                    currentStep={step}
                    pricing={pricing}
                    partnership={partnership}
                    nextSteps={nextSteps}
                  />
                </div>
              </div>

              <p className="mt-3 text-center text-xs font-medium text-[#4A596E]">
                Live Flipbook Preview • Page {step + 1}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
