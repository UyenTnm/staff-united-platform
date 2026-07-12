"use client";

import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/components/auth/auth-provider";
import { IssueCard } from "@/components/issues/IssueCard";
import { QualityIssue, getMyQualityIssues } from "@/lib/employees/quality";
import { useEffect, useState } from "react";

export default function MyQualityPage() {
  const { employee } = useAuth();
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employee) return;

      const data = await getMyQualityIssues(employee.id);

      setIssues(data);
      setLoading(false);
    }

    loadData();
  }, [employee]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Quality</h1>

          <p className="text-slate-500 mt-2">
            View your quality records and respond to HR reviews.
          </p>

          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="rounded-lg border p-8 text-center text-slate-500">
                No quality issues.
              </div>
            ) : (
              issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  id={issue.id}
                  title={issue.issue_type}
                  employee={employee?.full_name ?? ""}
                  department={employee?.department ?? ""}
                  description={issue.description}
                  deduction={issue.deduction}
                  status={issue.status}
                  openUrl={`/performance/quality/${issue.id}`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
