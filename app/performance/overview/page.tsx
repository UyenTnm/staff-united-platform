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
import { getReviewMonth } from "@/lib/employees/bonus";
import { RoleGuard } from "@/components/auth/role-guard";

type SortKey = "name" | "total" | "quality" | "behavior" | "kaizen";

function scoreColor(score: number, max: number) {
  const ratio = max > 0 ? score / max : 0;

  if (ratio >= 0.8) return "text-brand-600";
  if (ratio >= 0.5) return "text-amber-600";
  return "text-red-600";
}

// 12 tháng gần nhất (tính theo cùng logic chốt lương ngày 25 với getReviewMonth),
// mới nhất trước, dùng cho dropdown chọn tháng.
function getRecentReviewMonths(count = 12) {
  const months: { value: string; label: string }[] = [];
  const current = getReviewMonth(new Date());
  const [year, month] = current.split("-").map(Number);

  for (let i = 0; i < count; i++) {
    const date = new Date(year, month - 1 - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    months.push({ value, label });
  }

  return months;
}

function downloadCsv(rows: EmployeePerformanceRow[], monthLabel: string) {
  const headers = [
    "Employee",
    "Department",
    "Role",
    "Quality",
    "Quality Issues",
    "Behavior",
    "Behavior Issues",
    "Kaizen",
    "Rewarded Kaizens",
    "Total",
  ];

  const escapeCell = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.fullName,
        r.department,
        r.role,
        r.quality,
        r.qualityIssues,
        r.behavior,
        r.behaviorIssues,
        r.kaizen,
        r.rewardedKaizens,
        r.total,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];

  // Thêm BOM để Excel đọc đúng tiếng Việt có dấu.
  const csvContent = "﻿" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `performance-overview-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function PerformanceOverviewPageContent() {
  const months = useMemo(() => getRecentReviewMonths(12), []);

  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [rows, setRows] = useState<EmployeePerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);

  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getPerformanceOverview(selectedMonth);
        setRows(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedMonth]);

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
          <h2 className="text-lg font-semibold mb-4">All Employees</h2>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <Input
              placeholder="Search name, department, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />

            <Button
              variant="outline"
              disabled={filteredRows.length === 0}
              onClick={() => downloadCsv(filteredRows, monthLabel)}
            >
              Export CSV
            </Button>
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

export default function PerformanceOverviewPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <PerformanceOverviewPageContent />
    </RoleGuard>
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
