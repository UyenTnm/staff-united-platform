interface StatCardProps {
  label: string;
  value: string | number;
  accent?: "slate" | "blue" | "amber" | "emerald" | "red";
}

const ACCENT_STYLES: Record<string, string> = {
  slate: "border-l-slate-400",
  blue: "border-l-blue-500",
  amber: "border-l-amber-500",
  emerald: "border-l-emerald-500",
  red: "border-l-red-500",
};

// Dùng chung cho Leads và Quotes page — hiển thị số liệu tổng quan
// theo từng giai đoạn pipeline, không phải trang trí.
export function StatCard({ label, value, accent = "slate" }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 ${ACCENT_STYLES[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
