"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getCurrentEmployee } from "@/lib/auth";
import { IssueCard } from "@/components/issues/IssueCard";

import {
  getBehaviorIssuesByStatus,
  getBehaviorHistory,
  type BehaviorWithEmployee,
} from "@/lib/employees/behavior";

type Tab = "overview" | "pending" | "manager" | "appeals" | "history";

const VALID_TABS: Tab[] = [
  "overview",
  "pending",
  "manager",
  "appeals",
  "history",
];

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pending", label: "Pending" },
  { key: "manager", label: "Manager Approval" },
  { key: "appeals", label: "Appeals" },
  { key: "history", label: "History" },
];

function BehaviorManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "overview",
  );

  const [loading, setLoading] = useState(true);

  const [waitingEmployee, setWaitingEmployee] = useState<
    BehaviorWithEmployee[]
  >([]);
  const [returnedToHR, setReturnedToHR] = useState<BehaviorWithEmployee[]>([]);
  const [resolvedByHR, setResolvedByHR] = useState<BehaviorWithEmployee[]>([]);
  const [waitingManager, setWaitingManager] = useState<BehaviorWithEmployee[]>(
    [],
  );
  const [approved, setApproved] = useState<BehaviorWithEmployee[]>([]);
  const [locked, setLocked] = useState<BehaviorWithEmployee[]>([]);
  const [history, setHistory] = useState<BehaviorWithEmployee[]>([]);

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

        const [
          waitingEmployeeData,
          returnedToHRData,
          resolvedByHRData,
          waitingManagerData,
          approvedData,
          lockedData,
          historyData,
        ] = await Promise.all([
          getBehaviorIssuesByStatus("Waiting Employee"),
          getBehaviorIssuesByStatus("Returned to HR"),
          getBehaviorIssuesByStatus("Resolved by HR"),
          getBehaviorIssuesByStatus("Waiting Manager"),
          getBehaviorIssuesByStatus("Approved"),
          getBehaviorIssuesByStatus("Locked"),
          getBehaviorHistory(),
        ]);

        setWaitingEmployee(waitingEmployeeData);
        setReturnedToHR(returnedToHRData);
        setResolvedByHR(resolvedByHRData);
        setWaitingManager(waitingManagerData);
        setApproved(approvedData);
        setLocked(lockedData);
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
          <h1 className="text-3xl font-bold">Behavior Management</h1>

          <p className="text-slate-500 mt-2">
            Manage employee behavior issues and disciplinary records.
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
              {t.key === "pending" && ` (${waitingEmployee.length})`}
              {t.key === "manager" && ` (${waitingManager.length})`}
              {t.key === "appeals" && ` (${returnedToHR.length})`}
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
                  value={waitingEmployee.length}
                  onClick={() => setTab("pending")}
                />
                <StatCard
                  label="Returned to HR"
                  value={returnedToHR.length}
                  onClick={() => setTab("appeals")}
                />
                <StatCard
                  label="Resolved by HR"
                  value={resolvedByHR.length}
                  onClick={() => setTab("history")}
                />
                <StatCard
                  label="Waiting Manager"
                  value={waitingManager.length}
                  onClick={() => setTab("manager")}
                />
                <StatCard
                  label="Approved"
                  value={approved.length}
                  onClick={() => setTab("history")}
                />
                <StatCard
                  label="Locked"
                  value={locked.length}
                  onClick={() => setTab("history")}
                />
              </div>
            )}

            {tab === "pending" && (
              <IssueList
                issues={waitingEmployee}
                emptyText="No pending behavior issues."
                hrefFor={(id) => `/behavior/review/${id}`}
              />
            )}

            {tab === "manager" && (
              <IssueList
                issues={waitingManager}
                emptyText="No behavior issues waiting for manager approval."
                hrefFor={(id) => `/behavior/manager/${id}`}
              />
            )}

            {tab === "appeals" && (
              <IssueList
                issues={returnedToHR}
                emptyText="No behavior appeals waiting for HR review."
                hrefFor={(id) => `/behavior/review/${id}`}
              />
            )}

            {tab === "history" && (
              <IssueList
                issues={history}
                emptyText="No completed reviews."
                hrefFor={(id) => `/behavior/review/${id}`}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function BehaviorManagementPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <Card className="p-8 text-center text-slate-500">Loading...</Card>
        </AppLayout>
      }
    >
      <BehaviorManagementContent />
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
  issues: BehaviorWithEmployee[];
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
