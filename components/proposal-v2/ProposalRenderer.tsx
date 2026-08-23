"use client";

import CoverPage from "./pages/CoverPage";
import NextStepsPage from "./pages/NextStepsPage";
import PartnershipPage from "./pages/PartnershipPage";
import PricingPage from "./pages/PricingPage";
import ScopePage from "./pages/ScopePage";
import { CoverPageData, ScopePageData, PricingPageData } from "./types";

interface ProposalRendererProps {
  cover: CoverPageData;
}

export default function ProposalRenderer({ cover }: ProposalRendererProps) {
  const scope: ScopePageData = {
    projectTitle: cover.proposalTitle,
    packageName: "Strategic Partnership Package",
    totalPrice: "VND 45,000,000",
    services: [
      {
        title: "Business Process Optimisation",
        description: "Workflow improvement & automation",
        price: "8,000,000",
      },
      {
        title: "Marketing Execution Support",
        description: "Campaign planning & execution",
        price: "12,000,000",
      },
      {
        title: "Customer Success Improvement",
        description: "Retention & client experience",
        price: "10,000,000",
      },
      {
        title: "Website & CRM Enhancement",
        description: "Website optimisation & CRM setup",
        price: "15,000,000",
      },
      {
        title: "Long-term Growth Partnership",
        description: "Ongoing strategic support",
        price: "Included",
      },
    ],
  };

  const pricing: PricingPageData = {
    packageTitle: "Business Process Optimisation",

    strategicObjective:
      "Optimise internal workflows and improve operational efficiency through automation.\n\Reduce manual tasks, increase visibility across departments, and create a scalable business process for long-term growth.",

    deliverables: [
      "Workflow audit & process mapping",
      "Automation opportunity analysis",
      "SOP optimisation",
      "Task management structure",
      "Internal reporting dashboard",
      "Team implementation support",
    ],

    timeline: "4–8 Weeks",

    price: "18,000,000 VND",
  };

  const partnership = {
    packageName: "STRATEGIC PARTNERSHIP PACKAGE",

    individualPackages: [
      { title: "Business Process Optimisation", price: "8,000,000" },
      { title: "Marketing Execution Support", price: "12,000,000" },
      { title: "Customer Success Improvement", price: "10,000,000" },
      { title: "Website & CRM Enhancement", price: "15,000,000" },
    ],

    totalPrice: "45,000,000 VND",

    finalPrice: "Price VND",

    savePrice: "SAVE PRICE VND",

    discount: "0%",

    paymentTerms: [
      "50% deposit required to initiate the project.",
      "50% final payment due upon completion.",
      "Additional work outside agreed scope quoted separately.",
      "Text",
      "Text",
    ],
  };

  const nextSteps = {
    preparedBy: "STAFF United",
    email: "website@staffunitedgroup.com",
    nextSteps: [
      "Review and confirm the proposed scope.",
      "Approve the final package and timeline.",
      "Sign the Service Agreement.",
      "Project kickoff and onboarding session.",
    ],
  };

  return (
    <div className="space-y-8">
      <CoverPage data={cover} />
      <ScopePage data={scope} />
      <PricingPage data={pricing} />
      <PartnershipPage data={partnership} />
      <NextStepsPage data={nextSteps} />
    </div>
  );
}
