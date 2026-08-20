"use client";

import { useMemo, useState } from "react";
import type { Quote } from "@/lib/crm/quotes";
import type { QuoteItem } from "@/lib/crm/quote-items";

// import { CoverEditor } from "./editors/cover-editor";
// import { PricingEditor } from './editors/pricing-editor';
// import { PackageEditor } from "./editors/package-editor";
// import { FinalEditor } from "./editors/final-editor";
import { ClosingEditor } from "./editors/closing-editor";

// import { CoverPage } from "./templates/cover-page";
// import { PricingPage } from "./templates/pricing-page";
import { PackagePage } from "./templates/package-page";
import { FinalPage } from "./templates/final-page";
import { ClosingPage } from "./templates/closing-page";
import { CoverEditor } from "./editors/cover-editor";
import { PackageEditor } from "./editors/package-editor";
import { FinalEditor } from "./editors/final-editor";
import { CoverPage } from "./templates/cover-page";
import { PricingPage } from "./editors/pricing-page";
import { PricingEditor } from "./editors/pricing-editor";

type Step = "cover" | "pricing" | "package" | "final" | "closing" | "preview";

interface Props {
  quote: Quote;
  items: QuoteItem[];
  onQuoteRefresh: () => void;
}

export function ProposalWizard({ quote, items }: Props) {
  const [step, setStep] = useState<Step>("cover");
  const [packageIndex, setPackageIndex] = useState(0);

  const packages = useMemo(() => items, [items]);

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* LEFT */}
      <aside className="w-72 border-r bg-white p-4">
        <h2 className="mb-4 text-lg font-bold">Proposal Builder</h2>

        <StepButton active={step === "cover"} onClick={() => setStep("cover")}>
          Cover
        </StepButton>

        <StepButton
          active={step === "pricing"}
          onClick={() => setStep("pricing")}
        >
          Pricing
        </StepButton>

        {packages.map((pkg, i) => (
          <StepButton
            key={pkg.id}
            active={step === "package" && packageIndex === i}
            onClick={() => {
              setPackageIndex(i);
              setStep("package");
            }}
          >
            {pkg.service_name}
          </StepButton>
        ))}

        <StepButton active={step === "final"} onClick={() => setStep("final")}>
          Final Pricing
        </StepButton>

        <StepButton
          active={step === "closing"}
          onClick={() => setStep("closing")}
        >
          Closing
        </StepButton>

        <StepButton
          active={step === "preview"}
          onClick={() => setStep("preview")}
        >
          Flipbook Preview
        </StepButton>
      </aside>

      {/* CENTER */}
      <main className="flex-1 overflow-auto bg-slate-100 p-6">
        {step === "cover" && <CoverEditor quote={quote} />}

        {step === "pricing" && <PricingEditor items={packages} />}

        {step === "package" && <PackageEditor item={packages[packageIndex]} />}

        {step === "final" && <FinalEditor quote={quote} items={packages} />}

        {step === "closing" && <ClosingEditor />}

        {step === "preview" && <div>Flipbook Here</div>}
      </main>

      {/* RIGHT */}
      <aside className="w-[430px] border-l bg-slate-200 p-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          {step === "cover" && <CoverPage quote={quote} items={packages} />}

          {step === "pricing" && <PricingPage items={packages} />}

          {step === "package" && (
            <PackagePage
              item={packages[packageIndex]}
              pageNumber={packageIndex + 1}
            />
          )}

          {step === "final" && <FinalPage quote={quote} items={packages} />}

          {step === "closing" && <ClosingPage />}
        </div>
      </aside>
    </div>
  );
}

function StepButton({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 w-full rounded-lg p-3 text-left transition ${
        active ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
