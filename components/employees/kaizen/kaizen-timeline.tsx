interface Props {
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Approved"
    | "Implemented"
    | "Rewarded";

  createdAt?: string;
  updatedAt?: string;
  implementedAt?: string | null;
}

const STEPS = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Implemented",
  "Rewarded",
] as const;

function getStepState(current: Props["status"], step: (typeof STEPS)[number]) {
  const currentIndex = STEPS.indexOf(current);
  const stepIndex = STEPS.indexOf(step);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";

  return "upcoming";
}

export function KaizenTimeline({
  status,
  createdAt,
  updatedAt,
  implementedAt,
}: Props) {
  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const state = getStepState(status, step);

        return (
          <div key={step} className="flex items-start gap-4">
            {/* Left */}
            <div className="flex flex-col items-center">
              <div
                className={
                  state === "completed"
                    ? "w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs"
                    : state === "current"
                      ? "w-5 h-5 rounded-full bg-yellow-500"
                      : "w-5 h-5 rounded-full bg-slate-300"
                }
              >
                {state === "completed" && "✓"}
              </div>

              {index < STEPS.length - 1 && (
                <div className="w-px h-8 bg-slate-300 mt-1" />
              )}
            </div>

            {/* Right */}
            <div className="pb-6">
              <p
                className={
                  state === "upcoming"
                    ? "text-slate-400"
                    : "font-semibold text-slate-900"
                }
              >
                {step}
              </p>

              {step === "Draft" && createdAt && (
                <p className="text-xs text-slate-500">Created</p>
              )}

              {step === "Approved" && status !== "Draft" && updatedAt && (
                <p className="text-xs text-slate-500">Approved</p>
              )}

              {step === "Implemented" && implementedAt && (
                <p className="text-xs text-slate-500">Implemented</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
