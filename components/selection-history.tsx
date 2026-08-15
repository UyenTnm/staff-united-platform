"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { getSelectionLog, SelectionLogEntry } from "@/lib/crm/quote-selection-log";

interface SelectionHistoryProps {
  quoteId: string;
  currencySymbol: string;
}

// Hiện lịch sử mỗi lần khách đổi lựa chọn dịch vụ — dùng để admin
// phân tích hành vi khách (dịch vụ nào hay bị đổi ý, bỏ bớt...).
export function SelectionHistory({
  quoteId,
  currencySymbol,
}: SelectionHistoryProps) {
  const [log, setLog] = useState<SelectionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSelectionLog(quoteId);
      setLog(data);
      setLoading(false);
    }
    load();
  }, [quoteId]);

  if (loading || log.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Client Selection History
        </h2>
      </div>

      <div className="space-y-2">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {new Date(entry.changed_at).toLocaleString()}
              </span>
              <span className="font-semibold text-emerald-700">
                {currencySymbol}
                {Number(entry.total_amount).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {entry.selected_items}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}