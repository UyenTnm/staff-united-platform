import { KaizenStatus } from "@/lib/employees/kaizen";

type Props = {
  status: KaizenStatus;
  createdAt?: string;
  updatedAt?: string;
  implementedAt?: string;
};

const STEPS = [
  "Draft",
  "Submitted",
  "Under Review",
  "Waiting Manager Review",
  "Approved",
  "In Progress",
  "Waiting Verification",
  "Verified",
  "Rewarded",
] as const;

const STEP_LABELS: Record<KaizenStatus, string> = {
  Draft: "Draft",
  Submitted: "Submitted",
  "Under Review": "Administrative Review",
  "Waiting Manager Review": "Waiting Manager Review",
  Approved: "Approved",
  "In Progress": "Execution",
  "Waiting Verification": "Waiting Verification",
  Verified: "Verified",
  Implemented: "Implemented",
  Rewarded: "Rewarded",
};

function getStepState(current: Props["status"], step: (typeof STEPS)[number]) {
  const normalizedStatus = current === "Implemented" ? "Verified" : current;

  const currentIndex = STEPS.indexOf(
    normalizedStatus as (typeof STEPS)[number],
  );

  const stepIndex = STEPS.indexOf(step);

  // Rewarded là trạng thái hoàn tất cuối cùng
  if (current === "Rewarded") {
    return "completed";
  }

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

              {/* {index < STEPS.length - 1 && (
                <div className="w-px h-8 bg-slate-300 mt-1" />
              )} */}
              {index < STEPS.length - 1 && (
                <div
                  className={
                    state === "completed"
                      ? "w-px h-8 bg-green-500 mt-1"
                      : "w-px h-8 bg-slate-300 mt-1"
                  }
                />
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
                {STEP_LABELS[step]}
              </p>

              {step === "Approved" && updatedAt && (
                <p className="text-xs text-slate-500">Approved</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
