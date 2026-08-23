"use client";

import { useState } from "react";
import CoverStep from "./steps/CoverStep";
import WizardNavigation from "./WizardNavigation";
import ProposalRenderer from "../ProposalRenderer";
import { CoverPageData } from "../types";

const steps = ["Cover", "Scope", "Packages", "Partnership", "Next Steps"];

export default function ProposalWizard() {
  const [step, setStep] = useState(0);

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

            {step === 1 && (
              <div className="text-[#4A596E]">Scope Form (Next Step)</div>
            )}

            {step === 2 && (
              <div className="text-[#4A596E]">Package Builder</div>
            )}

            {step === 3 && (
              <div className="text-[#4A596E]">Partnership Form</div>
            )}

            {step === 4 && (
              <div className="text-[#4A596E]">Next Steps Form</div>
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
                  <ProposalRenderer cover={cover} />
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
