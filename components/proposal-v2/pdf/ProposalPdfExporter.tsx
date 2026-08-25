"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import { PDFDocument } from "pdf-lib";

// import CoverPage from "./pages/CoverPage";
// import ScopePage from "./pages/ScopePage";
// import PricingPage from "./pages/PricingPage";
// import PartnershipPage from "./pages/PartnershipPage";
// import NextStepsPage from "./pages/NextStepsPage";

// import {
//   CoverPageData,
//   ScopePageData,
//   PricingPageData,
//   PartnershipPageData,
//   NextStepsPageData,
// } from "./types";

import { QuotePage } from "@/lib/crm/quote-pages";
import CoverPage from "../pages/CoverPage";
import ScopePage from "../pages/ScopePage";
import PricingPage from "../pages/PricingPage";
import PartnershipPage from "../pages/PartnershipPage";
import NextStepsPage from "../pages/NextStepsPage";
import {
  CoverPageData,
  NextStepsPageData,
  PartnershipPageData,
  PricingPageData,
  ScopePageData,
} from "../types";

interface Props {
  pages: QuotePage[];
}

const PDF_WIDTH = 794;
const PDF_HEIGHT = 1123;

function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

export default function ProposalPdfDownload({ pages }: Props) {
  const [downloading, setDownloading] = useState(false);

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
    return null;
  }

  const cover = coverPage.structured_data as unknown as CoverPageData;

  const scope = scopePage.structured_data as unknown as ScopePageData;

  const partnership =
    partnershipPage.structured_data as unknown as PartnershipPageData;

  const nextSteps =
    nextStepsPage.structured_data as unknown as NextStepsPageData;

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);

    let exportRoot: HTMLDivElement | null = null;

    try {
      /*
       * ------------------------------------------------------------
       * Create an invisible export area.
       *
       * IMPORTANT:
       * We DO NOT capture the FlipBook.
       * We render each proposal page at the real 794 × 1123 size.
       * ------------------------------------------------------------
       */

      exportRoot = document.createElement("div");

      Object.assign(exportRoot.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: `${PDF_WIDTH}px`,
        height: `${PDF_HEIGHT}px`,
        background: "#ffffff",
        overflow: "hidden",
        zIndex: "-1",
        pointerEvents: "none",
      });

      document.body.appendChild(exportRoot);

      const pdf = await PDFDocument.create();

      /*
       * ------------------------------------------------------------
       * Helper:
       * Render one React page into the export container.
       *
       * We use the existing page components directly so the PDF
       * stays visually consistent with the flipbook.
       * ------------------------------------------------------------
       */

      const renderPage = async (pageElement: React.ReactNode) => {
        exportRoot!.innerHTML = "";

        const wrapper = document.createElement("div");

        Object.assign(wrapper.style, {
          width: `${PDF_WIDTH}px`,
          height: `${PDF_HEIGHT}px`,
          overflow: "hidden",
          background: "#ffffff",
        });

        exportRoot!.appendChild(wrapper);

        /*
         * We need React to render the page.
         *
         * ReactDOM is imported dynamically so this component stays
         * client-only and does not affect the normal proposal render.
         */
        const ReactDOM = await import("react-dom/client");

        const root = ReactDOM.createRoot(wrapper);

        root.render(pageElement);

        /*
         * Give React/browser one frame to finish layout.
         */
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(null)),
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        await waitForImages(wrapper);

        /*
         * Another small delay makes sure images/fonts/layout have
         * settled before html2canvas captures the page.
         */
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(wrapper, {
          width: PDF_WIDTH,
          height: PDF_HEIGHT,

          scale: 2,

          useCORS: true,
          allowTaint: false,

          backgroundColor: "#ffffff",

          logging: false,

          windowWidth: PDF_WIDTH,
          windowHeight: PDF_HEIGHT,
        });

        root.unmount();

        const pngDataUrl = canvas.toDataURL("image/png");

        const pngBytes = await fetch(pngDataUrl).then((res) =>
          res.arrayBuffer(),
        );

        const image = await pdf.embedPng(pngBytes);

        const pdfPage = pdf.addPage([PDF_WIDTH, PDF_HEIGHT]);

        pdfPage.drawImage(image, {
          x: 0,
          y: 0,
          width: PDF_WIDTH,
          height: PDF_HEIGHT,
        });
      };

      /*
       * ------------------------------------------------------------
       * PAGE 1 — COVER
       * ------------------------------------------------------------
       */

      await renderPage(
        <div
          style={{
            width: PDF_WIDTH,
            height: PDF_HEIGHT,
            overflow: "hidden",
          }}
        >
          <CoverPage data={cover} />
        </div>,
      );

      /*
       * ------------------------------------------------------------
       * PAGE 2 — SCOPE
       * ------------------------------------------------------------
       */

      await renderPage(
        <div
          style={{
            width: PDF_WIDTH,
            height: PDF_HEIGHT,
            overflow: "hidden",
          }}
        >
          <ScopePage data={scope} />
        </div>,
      );

      /*
       * ------------------------------------------------------------
       * PACKAGE / SERVICE PAGES
       * ------------------------------------------------------------
       */

      for (let index = 0; index < packagePages.length; index++) {
        const page = packagePages[index];

        const pricing = page.structured_data as unknown as PricingPageData;

        await renderPage(
          <div
            style={{
              width: PDF_WIDTH,
              height: PDF_HEIGHT,
              overflow: "hidden",
            }}
          >
            <PricingPage
              data={{
                ...pricing,
                clientLogo: cover.clientLogo,
              }}
              pageNumber={String(index + 3).padStart(2, "0")}
            />
          </div>,
        );
      }

      /*
       * ------------------------------------------------------------
       * PARTNERSHIP
       * ------------------------------------------------------------
       */

      await renderPage(
        <div
          style={{
            width: PDF_WIDTH,
            height: PDF_HEIGHT,
            overflow: "hidden",
          }}
        >
          <PartnershipPage
            data={{
              ...partnership,
              clientLogo: cover.clientLogo,
            }}
          />
        </div>,
      );

      /*
       * ------------------------------------------------------------
       * NEXT STEPS
       * ------------------------------------------------------------
       */

      await renderPage(
        <div
          style={{
            width: PDF_WIDTH,
            height: PDF_HEIGHT,
            overflow: "hidden",
          }}
        >
          <NextStepsPage
            data={{
              ...nextSteps,
              clientLogo: cover.clientLogo,
            }}
          />
        </div>,
      );

      /*
       * ------------------------------------------------------------
       * DOWNLOAD
       * ------------------------------------------------------------
       */

      const pdfBytes = await pdf.save();

      const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);

      new Uint8Array(pdfBuffer).set(pdfBytes);

      const blob = new Blob([pdfBuffer], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "proposal.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate proposal PDF:", error);

      const message = error instanceof Error ? error.message : String(error);

      alert(`PDF Error:\n${message}`);
    } finally {
      if (exportRoot) {
        exportRoot.remove();
      }

      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-slate-300
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-slate-700
        transition
        hover:bg-slate-50
        disabled:cursor-not-allowed
        disabled:opacity-60
        cursor-pointer
      "
    >
      {downloading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          Generating PDF...
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}
