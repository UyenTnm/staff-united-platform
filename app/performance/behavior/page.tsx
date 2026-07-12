"use client";

import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/components/auth/auth-provider";
import { IssueCard } from "@/components/issues/IssueCard";
import { BehaviorIssue, getMyBehaviorIssues } from "@/lib/employees/behavior";
import { useEffect, useState } from "react";

export default function MyBehaviorPage() {
  const { employee } = useAuth();
  const [issues, setIssues] = useState<BehaviorIssue[]>([]);
  useEffect(() => {
    async function loadData() {
      if (!employee) return;

      const data = await getMyBehaviorIssues(employee.id);

      setIssues(data);
    }

    loadData();
  }, [employee]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Behavior</h1>

          <p className="text-slate-500 mt-2">
            View your behavior records and respond to HR reviews.
          </p>

          <div className="space-y-4">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                id={issue.id}
                title={issue.issue_type}
                employee={employee?.full_name ?? ""}
                department={employee?.department ?? ""}
                description={issue.description}
                deduction={issue.deduction}
                status={issue.status}
                openUrl={`/performance/behavior/${issue.id}`}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
