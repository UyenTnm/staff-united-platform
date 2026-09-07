"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getCurrentEmployee } from "@/lib/auth";
import { IssueStatusBadge } from "@/components/issues/IssueStatusBadge";
import { IssueCard } from "@/components/issues/IssueCard";

import {
  getQualityStatistics,
  getQualityIssuesByStatus,
  getResolvedQualityIssues,
  type QualityWithEmployee,
} from "@/lib/employees/quality";

type Tab = "overview" | "pending" | "manager" | "appeals" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pending", label: "Pending" },
  { key: "manager", label: "Manager Approval" },
  { key: "appeals", label: "Appeals" },
  { key: "history", label: "History" },
];

const VALID_TABS: Tab[] = [
  "overview",
  "pending",
  "manager",
  "appeals",
  "history",
];

function QualityManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "overview",
  );
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    waitingEmployee: 0,
    returnedToHR: 0,
    resolvedByHR: 0,
    waitingManager: 0,
    approved: 0,
    locked: 0,
  });

  const [pending, setPending] = useState<QualityWithEmployee[]>([]);
  const [waitingManager, setWaitingManager] = useState<QualityWithEmployee[]>(
    [],
  );
  const [appeals, setAppeals] = useState<QualityWithEmployee[]>([]);
  const [history, setHistory] = useState<QualityWithEmployee[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const employee = await getCurrentEmployee();

        if (!employee) {
          router.push("/login");
          return;
        }

        if (!["Admin", "HR", "Manager"].includes(employee.user_role)) {
          router.push("/403");
          return;
        }

        const [statistics, pendingData, managerData, appealsData, historyData] =
          await Promise.all([
            getQualityStatistics(),
            getQualityIssuesByStatus("Waiting Employee"),
            getQualityIssuesByStatus("Waiting Manager"),
            getQualityIssuesByStatus("Returned to HR"),
            getResolvedQualityIssues(),
          ]);

        setStats(statistics);
        setPending(pendingData);
        setWaitingManager(managerData);
        setAppeals(appealsData);
        setHistory(historyData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quality Management</h1>

          <p className="text-slate-500 mt-2">
            Manage employee quality issues, work quality and performance
            deductions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "outline"}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === "pending" && ` (${pending.length})`}
              {t.key === "manager" && ` (${waitingManager.length})`}
              {t.key === "appeals" && ` (${appeals.length})`}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card className="p-8 text-center text-slate-500">Loading...</Card>
        ) : (
          <>
            {tab === "overview" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                  label="Waiting Employee"
                  value={stats.waitingEmployee}
                  onClick={() => setTab("pending")}
                />
                <StatCard
                  label="Returned to HR"
                  value={stats.returnedToHR}
                  onClick={() => setTab("appeals")}
                />
                <StatCard
                  label="Resolved by HR"
                  value={stats.resolvedByHR}
                  onClick={() => setTab("history")}
                />
                <StatCard
                  label="Waiting Manager"
                  value={stats.waitingManager}
                  onClick={() => setTab("manager")}
                />
                <StatCard
                  label="Approved"
                  value={stats.approved}
                  onClick={() => setTab("history")}
                />
                <StatCard
                  label="Locked"
                  value={stats.locked}
                  onClick={() => setTab("history")}
                />
              </div>
            )}

            {tab === "pending" && (
              <IssueList
                issues={pending}
                emptyText="No pending quality issues."
                hrefFor={(id) => `/quality/review/${id}`}
              />
            )}

            {tab === "manager" && (
              <IssueList
                issues={waitingManager}
                emptyText="No quality issues waiting for manager approval."
                hrefFor={(id) => `/quality/manager/${id}`}
              />
            )}

            {tab === "appeals" && (
              <IssueList
                issues={appeals}
                emptyText="No quality appeals waiting for HR review."
                hrefFor={(id) => `/quality/review/${id}`}
              />
            )}

            {tab === "history" && (
              <IssueList
                issues={history}
                emptyText="No quality history found."
                hrefFor={(id) => `/quality/review/${id}`}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function QualityManagementPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <Card className="p-8 text-center text-slate-500">Loading...</Card>
        </AppLayout>
      }
    >
      <QualityManagementContent />
    </Suspense>
  );
}

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-6 ${onClick ? "cursor-pointer hover:border-slate-400 transition" : ""}`}
      onClick={onClick}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="text-4xl font-bold mt-3">{value}</h2>
      {onClick && (
        <p className="text-xs text-slate-400 mt-1">Click to see who</p>
      )}
    </Card>
  );
}

function IssueList({
  issues,
  emptyText,
  hrefFor,
}: {
  issues: QualityWithEmployee[];
  emptyText: string;
  hrefFor: (id: string) => string;
}) {
  if (issues.length === 0) {
    return <Card className="p-10 text-center text-slate-500">{emptyText}</Card>;
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          id={issue.id}
          title={issue.issue_type}
          employee={issue.employees.full_name}
          department={issue.employees.department}
          description={issue.description}
          deduction={issue.deduction}
          status={issue.status}
          openUrl={hrefFor(issue.id)}
        />
      ))}
    </div>
  );
}
