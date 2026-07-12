"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getBehaviorHistory,
  lockBehavior,
  type BehaviorWithEmployee,
} from "@/lib/employees/behavior";
import { IssueCard } from "@/components/issues/IssueCard";
import { toast } from "sonner";

export default function BehaviorHistoryPage() {
  const [issues, setIssues] = useState<BehaviorWithEmployee[]>([]);

  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function loadData() {
  //     const data = await getBehaviorHistory();

  //     setIssues(data);

  //     setLoading(false);
  //   }

  //   loadData();
  // }, []);

  async function loadData() {
    const data = await getBehaviorHistory();

    setIssues(data);

    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      await loadData();
    }

    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Behavior History</h1>

          <p className="text-slate-500 mt-2">
            Completed employee behavior reviews.
          </p>
        </div>

        {loading ? (
          <Card className="p-8">Loading...</Card>
        ) : issues.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No completed reviews.
          </Card>
        ) : (
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
                openUrl={`/behavior/review/${issue.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
