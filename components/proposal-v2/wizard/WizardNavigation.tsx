"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}: Props) {
  return (
    <div className="border-t bg-white px-8 py-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 rounded-lg border px-5 py-3 disabled:opacity-40"
        >
          <ArrowLeft size={18} />
          Previous
        </button>

        <div className="text-sm text-slate-500">
          {currentStep + 1} / {totalSteps}
        </div>

        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-40"
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
