"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  getPerformanceOverview,
  type EmployeePerformanceRow,
} from "@/lib/performance/overview";

type SortKey = "name" | "total" | "quality" | "behavior" | "kaizen";

function scoreColor(score: number, max: number) {
  const ratio = max > 0 ? score / max : 0;

  if (ratio >= 0.8) return "text-emerald-600";
  if (ratio >= 0.5) return "text-amber-600";
  return "text-red-600";
}

export default function PerformanceOverviewPage() {
  const [rows, setRows] = useState<EmployeePerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function load() {
      const data = await getPerformanceOverview();
      setRows(data);
      setLoading(false);
    }

    load();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = term
      ? rows.filter(
          (r) =>
            r.fullName.toLowerCase().includes(term) ||
            r.department.toLowerCase().includes(term) ||
            r.role.toLowerCase().includes(term),
        )
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case "name":
          cmp = a.fullName.localeCompare(b.fullName);
          break;
        case "total":
          cmp = a.total - b.total;
          break;
        case "quality":
          cmp = a.quality - b.quality;
          break;
        case "behavior":
          cmp = a.behavior - b.behavior;
          break;
        case "kaizen":
          cmp = a.kaizen - b.kaizen;
          break;
      }

      return sortAsc ? cmp : -cmp;
    });

    return sorted;
  }, [rows, search, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  }

  const companyAverage =
    rows.length > 0
      ? (rows.reduce((sum, r) => sum + r.total, 0) / rows.length).toFixed(1)
      : "-";

  const atRiskCount = rows.filter((r) => r.total / 15 < 0.5).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Performance Overview</h1>
            <p className="text-slate-500 mt-2">{monthLabel} — all employees</p>
          </div>

          <Button asChild variant="outline">
            <Link href="/reviews">Monthly Review Cycle →</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Employees</p>
            <h2 className="text-3xl font-bold mt-2">{rows.length}</h2>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500">Company Average</p>
            <h2 className="text-3xl font-bold mt-2">{companyAverage} / 15</h2>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500">
              Below 50% (needs attention)
            </p>
            <h2 className="text-3xl font-bold mt-2 text-red-600">
              {atRiskCount}
            </h2>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">All Employees</h2>

            <Input
              placeholder="Search name, department, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No employees match this search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <SortableHeader
                      label="Employee"
                      active={sortKey === "name"}
                      asc={sortAsc}
                      onClick={() => toggleSort("name")}
                    />
                    <th className="py-3">Department</th>
                    <SortableHeader
                      label="Quality"
                      active={sortKey === "quality"}
                      asc={sortAsc}
                      onClick={() => toggleSort("quality")}
                    />
                    <SortableHeader
                      label="Behavior"
                      active={sortKey === "behavior"}
                      asc={sortAsc}
                      onClick={() => toggleSort("behavior")}
                    />
                    <SortableHeader
                      label="Kaizen"
                      active={sortKey === "kaizen"}
                      asc={sortAsc}
                      onClick={() => toggleSort("kaizen")}
                    />
                    <SortableHeader
                      label="Total"
                      active={sortKey === "total"}
                      asc={sortAsc}
                      onClick={() => toggleSort("total")}
                    />
                    <th className="py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.employeeId}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="py-3 font-medium">{row.fullName}</td>
                      <td className="py-3 text-slate-500">{row.department}</td>
                      <td
                        className={`py-3 font-semibold ${scoreColor(row.quality, 5)}`}
                      >
                        {row.quality}/5
                      </td>
                      <td
                        className={`py-3 font-semibold ${scoreColor(row.behavior, 5)}`}
                      >
                        {row.behavior}/5
                      </td>
                      <td
                        className={`py-3 font-semibold ${scoreColor(row.kaizen, 5)}`}
                      >
                        {row.kaizen}/5
                      </td>
                      <td
                        className={`py-3 font-bold ${scoreColor(row.total, 15)}`}
                      >
                        {row.total}/15
                      </td>
                      <td className="py-3 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/employees/${row.employeeId}/summary`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function SortableHeader({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <th className="py-3">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 font-medium ${
          active ? "text-slate-900" : "text-slate-500"
        }`}
      >
        {label}
        {active && <span>{asc ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
