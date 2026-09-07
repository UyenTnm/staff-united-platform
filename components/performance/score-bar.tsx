interface ScoreBarProps {
  label: string;

  score: number;

  max: number;

  helper?: string;

  size?: "sm" | "lg";
}

/**
 * Visual score bar used across the Performance dashboards
 * (My Performance, Employee Summary, Monthly Reviews).
 *
 * Color reflects how close the score is to its max:
 *  - >= 80%  -> green  (healthy)
 *  - 50-79%  -> amber  (watch)
 *  - < 50%   -> red    (at risk)
 */
export function ScoreBar({
  label,
  score,
  max,
  helper,
  size = "sm",
}: ScoreBarProps) {
  const ratio = max > 0 ? score / max : 0;

  const pct = Math.max(0, Math.min(100, ratio * 100));

  const barColor =
    ratio >= 0.8
      ? "bg-brand-500"
      : ratio >= 0.5
        ? "bg-amber-500"
        : "bg-red-500";

  const textColor =
    ratio >= 0.8
      ? "text-brand-600"
      : ratio >= 0.5
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={
            size === "lg"
              ? "text-base font-semibold text-slate-700"
              : "text-sm font-medium text-slate-600"
          }
        >
          {label}
        </p>

        <p
          className={`font-bold ${textColor} ${
            size === "lg" ? "text-3xl" : "text-sm"
          }`}
        >
          {score}
          <span className="text-slate-400 font-normal">/{max}</span>
        </p>
      </div>

      <div
        className={`mt-2 w-full overflow-hidden rounded-full bg-slate-100 ${
          size === "lg" ? "h-3" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}
