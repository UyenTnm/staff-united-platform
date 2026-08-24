"use client";

import { useState } from "react";
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

const steps = ["Cover", "Scope", "Packages", "Partnership", "Next Steps"];

export default function ProposalWizard() {
  const [step, setStep] = useState(0);
  const [contentOverflow, setContentOverflow] = useState(false);

  const [cover, setCover] = useState<CoverPageData>({
    proposalTitle: "Strategic Growth Proposal",
    proposalDetails: [
      "Business Process Optimisation",
      "Marketing Execution Support",
      "Customer Success Improvement",
      "Website & CRM Enhancement",
      "Long-term Growth Partnership",
    ],
    preparedFor: "PL Cafe",
    preparedBy: "STAFF United",
    date: "22 August 2026",
    coverPositionX: 0,
    coverPositionY: 0,
    coverScale: 1.35,
  });

  const [scope, setScope] = useState<ScopePageData>({
    projectTitle: "Strategic Growth Proposal",

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
    ],

    packageName: "Strategic Partnership Package",

    totalPrice: "40,500,000",
    originalPrice: "45,000,000",

    discount: "10",

    finalPrice: "40,500,000",
    currency: "VND",
    clientLogo: "",

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

  const [pricing, setPricing] = useState<PricingPageData>({
    packageTitle: "Business Process Optimisation",

    strategicObjective:
      "Optimise internal workflows and improve operational efficiency through automation.\nReduce manual tasks, increase visibility across departments, and create a scalable business process for long-term growth.",

    deliverables: [
      "Workflow audit & process mapping",
      "Automation opportunity analysis",
      "SOP optimisation",
      "Task management structure",
      "Internal reporting dashboard",
      "Team implementation support",
    ],

    timeline: "4–8 Weeks",

    price: "18,000,000",

    currency: "VND",

    clientLogo: "",
  });

  const [partnership, setPartnership] = useState<PartnershipPageData>({
    packageName: "STRATEGIC PARTNERSHIP PACKAGE",

    individualPackages: [
      {
        title: "Business Process Optimisation",
        price: "8,000,000",
      },
      {
        title: "Marketing Execution Support",
        price: "12,000,000",
      },
      {
        title: "Customer Success Improvement",
        price: "10,000,000",
      },
      {
        title: "Website & CRM Enhancement",
        price: "15,000,000",
      },
    ],

    totalPrice: "45,000,000",

    finalPrice: "Price VND",

    savePrice: "SAVE PRICE VND",

    discount: "0%",

    currency: "VND",

    paymentTerms: [
      "50% deposit required to initiate the project.",
      "50% final payment due upon completion.",
      "Additional work outside agreed scope quoted separately.",
    ],

    clientLogo: "",
  });

  const [nextSteps, setNextSteps] = useState<NextStepsPageData>({
    preparedBy: "STAFF United",

    email: "website@staffunitedgroup.com",

    nextSteps: [
      "Review and confirm the proposed scope.",
      "Approve the final package and timeline.",
      "Sign the Service Agreement.",
      "Project kickoff and onboarding session.",
    ],

    closingMessage:
      "We look forward to supporting your business in strengthening its brand visibility, professional market presence, and business development across physical and digital channels.",

    clientLogo: "",
  });

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
      <div className="grid flex-1 grid-cols-12 overflow-hidden min-h-0">
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
                Live Flipbook Preview • Page 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
