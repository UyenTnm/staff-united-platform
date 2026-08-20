"use client";

interface Props {
  steps: string[];
  active: number;
  onChange: (index: number) => void;
}

export function StepSidebar({ steps, active, onChange }: Props) {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <h2 className="mb-5 text-lg font-bold">Proposal Builder</h2>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <button
            key={step}
            onClick={() => onChange(i)}
            className={`w-full rounded-lg p-3 text-left transition ${
              active === i
                ? "bg-[#0F4C81] text-white"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <p className="text-xs opacity-70">STEP {i + 1}</p>
            <p className="font-medium">{step}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
