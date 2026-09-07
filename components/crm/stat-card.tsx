interface StatCardProps {
  label: string;
  value: string | number;
  accent?: "slate" | "blue" | "amber" | "emerald" | "red";
}

const ACCENT_STYLES: Record<string, string> = {
  slate: "border-l-slate-400",
  blue: "border-l-blue-500",
  amber: "border-l-amber-500",
  emerald: "border-l-brand-500",
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
      {/* ĐÃ SỬA — cho phép xuống dòng (break-words) thay vì tràn ra
          ngoài khung khi số quá lớn (VD: ₫600,000,000). Giảm cỡ chữ
          một chút để vừa khung hơn. */}
      <p className="mt-1 break-words text-xl font-bold leading-tight text-slate-900 dark:text-white sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
