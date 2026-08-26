"use client";

import HTMLFlipBookRaw from "react-pageflip";
import Image from "next/image";

import CoverPage from "./pages/CoverPage";
import ScopePage from "./pages/ScopePage";
import PricingPage from "./pages/PricingPage";
import PartnershipPage from "./pages/PartnershipPage";
import NextStepsPage from "./pages/NextStepsPage";

import {
  CoverPageData,
  ScopePageData,
  PricingPageData,
  PartnershipPageData,
  NextStepsPageData,
} from "./types";

import { QuotePage } from "@/lib/crm/quote-pages";
import ProposalPdfDownload from "./pdf/ProposalPdfExporter";

const HTMLFlipBook = HTMLFlipBookRaw as any;

interface Props {
  pages: QuotePage[];
}

export default function ProposalV2Flipbook({ pages }: Props) {
  const coverPage = pages.find((page) => page.page_type === "custom");

  const scopePage = pages.find((page) => page.page_type === "pricing_overview");

  const packagePages = pages.filter(
    (page) => page.page_type === "package_detail",
  );

  const partnershipPage = pages.find(
    (page) => page.page_type === "partnership_summary",
  );

  const nextStepsPage = pages.find((page) => page.page_type === "next_steps");

  if (!coverPage || !scopePage || !partnershipPage || !nextStepsPage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        Proposal template is incomplete.
      </div>
    );
  }

  const cover = coverPage.structured_data as unknown as CoverPageData;

  const scope = scopePage.structured_data as unknown as ScopePageData;

  const partnership =
    partnershipPage.structured_data as unknown as PartnershipPageData;

  const nextSteps =
    nextStepsPage.structured_data as unknown as NextStepsPageData;

  <style jsx global>{`
    .proposal-v2-flipbook .stf__parent {
      width: 400px !important;
      max-width: 400px !important;
      height: 566px !important;
    }

    .proposal-v2-flipbook .stf__wrapper {
      width: 400px !important;
      height: 566px !important;
      padding-bottom: 0 !important;
    }

    .proposal-v2-flipbook .stf__block {
      width: 400px !important;
      height: 566px !important;
    }
  `}</style>;

  return (
    <div className="proposal-v2-flipbook flex flex-col items-center">
      <div
        style={{
          width: 400,
          height: 566,
          overflow: "hidden",
        }}
      >
        <HTMLFlipBook
          width={400}
          height={566}
          size="fixed"
          showCover={false}
          showPageCorners={false}
          drawShadow={true}
          mobileScrollSupport={true}
          // className="shadow-2xl"
        >
          {/* =========================
          COVER
      ========================= */}

          <div
            className="relative overflow-hidden"
            style={{
              width: 400,
              height: 566,
            }}
          >
            <div
              style={{
                width: 794,
                height: 1123,
                transform: "scale(0.504)",
                transformOrigin: "top left",
              }}
            >
              <CoverPage data={cover} />
            </div>
          </div>

          {/* =========================
          SCOPE
      ========================= */}

          <div
            className="relative overflow-hidden"
            style={{
              width: 400,
              height: 566,
            }}
          >
            <div
              style={{
                width: 794,
                height: 1123,
                transform: "scale(0.504)",
                transformOrigin: "top left",
              }}
            >
              <ScopePage data={scope} />
            </div>
          </div>

          {/* =========================
          PACKAGE / SERVICE PAGES
      ========================= */}

          {packagePages.map((page, index) => {
            const pricing = page.structured_data as unknown as PricingPageData;

            return (
              <div
                key={page.id}
                className="relative overflow-hidden"
                style={{
                  width: 400,
                  height: 566,
                }}
              >
                <div
                  style={{
                    width: 794,
                    height: 1123,
                    transform: "scale(0.504)",
                    transformOrigin: "top left",
                  }}
                >
                  <PricingPage
                    data={{
                      ...pricing,
                      clientLogo: cover.clientLogo,
                    }}
                    pageNumber={String(index + 3).padStart(2, "0")}
                  />
                </div>
              </div>
            );
          })}

          {/* =========================
          PARTNERSHIP
      ========================= */}

          <div
            className="relative overflow-hidden"
            style={{
              width: 400,
              height: 566,
            }}
          >
            <div
              style={{
                width: 794,
                height: 1123,
                transform: "scale(0.504)",
                transformOrigin: "top left",
              }}
            >
              <PartnershipPage
                data={{
                  ...partnership,
                  clientLogo: cover.clientLogo,
                }}
              />
            </div>
          </div>

          {/* =========================
          NEXT STEPS
      ========================= */}

          <div
            className="relative overflow-hidden"
            style={{
              width: 400,
              height: 566,
            }}
          >
            <div
              style={{
                width: 794,
                height: 1123,
                transform: "scale(0.504)",
                transformOrigin: "top left",
              }}
            >
              <NextStepsPage
                data={{
                  ...nextSteps,
                  clientLogo: cover.clientLogo,
                }}
              />
            </div>
          </div>
        </HTMLFlipBook>
      </div>
      <p className="text-xs mt-2 mb-2 text-slate-400">
        Click or drag the corner of the page to flip
      </p>
      <ProposalPdfDownload pages={pages} />
    </div>
  );
}
