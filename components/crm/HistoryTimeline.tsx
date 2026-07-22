"use client";

import { useEffect, useState } from "react";

import { getAuditHistory } from "@/lib/crm/audit";
import { AuditEntity, AuditLog } from "@/types/crm/audit";

interface HistoryTimelineProps {
  entityType: AuditEntity;
  entityId: string;
}

export default function HistoryTimeline({
  entityType,
  entityId,
}: HistoryTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getAuditHistory(entityType, entityId);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">History</h2>

        <div className="mt-6 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">History</h2>

        <div className="mt-8 text-center text-sm text-slate-500">
          No history found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">History</h2>

      <div className="mt-6 space-y-5">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold capitalize">{log.action}</span>

              <span className="text-xs text-slate-400">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>

            <div className="mt-3 text-sm">
              <span className="font-medium">{log.field_name}</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Old</p>

                <div className="rounded-lg bg-red-50 p-2 text-sm">
                  {log.old_value ?? "-"}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">New</p>

                <div className="rounded-lg bg-emerald-50 p-2 text-sm">
                  {log.new_value ?? "-"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
