"use client";

import { useEffect, useState } from "react";
import { getPipelineStats } from "@/lib/crm/dashboard";

interface PipelineStats {
  new: number;
  contacted: number;
  proposal: number;
  won: number;
  lost: number;
}

export default function PipelineSummary() {
  const [stats, setStats] = useState<PipelineStats>({
    new: 0,
    contacted: 0,
    proposal: 0,
    won: 0,
    lost: 0,
  });

  useEffect(() => {
    async function load() {
      setStats(await getPipelineStats());
    }

    load();
  }, []);

  const rows = [
    {
      label: "New",
      value: stats.new,
      color: "bg-blue-500",
    },
    {
      label: "Contacted",
      value: stats.contacted,
      color: "bg-yellow-500",
    },
    {
      label: "Proposal Sent",
      value: stats.proposal,
      color: "bg-orange-500",
    },
    {
      label: "Won",
      value: stats.won,
      color: "bg-green-500",
    },
    {
      label: "Lost",
      value: stats.lost,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Sales Pipeline</h2>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${row.color}`} />

              <span>{row.label}</span>
            </div>

            <span className="font-bold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
