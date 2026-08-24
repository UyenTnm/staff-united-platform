"use client";

import CoverPage from "./pages/CoverPage";
import NextStepsPage from "./pages/NextStepsPage";
import PartnershipPage from "./pages/PartnershipPage";
import PricingPage from "./pages/PricingPage";
import ScopePage from "./pages/ScopePage";
import {
  CoverPageData,
  ScopePageData,
  PricingPageData,
  PartnershipPageData,
  NextStepsPageData,
} from "./types";

interface ProposalRendererProps {
  cover: CoverPageData;
  scope: ScopePageData;
  pricing: PricingPageData;
  partnership: PartnershipPageData;
  currentStep: number;
  nextSteps: NextStepsPageData;
  onPricingOverflowChange?: (overflow: boolean) => void;
}

export default function ProposalRenderer({
  cover,
  scope,
  pricing,
  partnership,
  nextSteps,
  currentStep,
  onPricingOverflowChange,
}: ProposalRendererProps) {
  // const partnership = {
  //   packageName: "STRATEGIC PARTNERSHIP PACKAGE",

  //   individualPackages: [
  //     { title: "Business Process Optimisation", price: "8,000,000" },
  //     { title: "Marketing Execution Support", price: "12,000,000" },
  //     { title: "Customer Success Improvement", price: "10,000,000" },
  //     { title: "Website & CRM Enhancement", price: "15,000,000" },
  //   ],

  //   totalPrice: "45,000,000 VND",

  //   finalPrice: "Price VND",

  //   savePrice: "SAVE PRICE VND",

  //   discount: "0%",

  //   paymentTerms: [
  //     "50% deposit required to initiate the project.",
  //     "50% final payment due upon completion.",
  //     "Additional work outside agreed scope quoted separately.",
  //     "Text",
  //     "Text",
  //   ],
  // };

  return (
    <div>
      {currentStep === 0 && <CoverPage data={cover} />}

      {currentStep === 1 && (
        <ScopePage
          data={{
            ...scope,
            clientLogo: cover.clientLogo,
          }}
        />
      )}

      {currentStep === 2 && (
        <PricingPage
          data={pricing}
          onOverflowChange={onPricingOverflowChange}
        />
      )}

      {currentStep === 3 && <PartnershipPage data={partnership} />}

      {currentStep === 4 && (
        <NextStepsPage
          data={{
            ...nextSteps,
            clientLogo: cover.clientLogo,
          }}
        />
      )}
    </div>
  );
}
