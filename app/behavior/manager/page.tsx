"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  BehaviorWithEmployee,
  getBehaviorIssuesByStatus,
} from "@/lib/employees/behavior";

export default function BehaviorManagerPage() {
  const [issues, setIssues] = useState<BehaviorWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBehaviorIssuesByStatus("Waiting Manager");

        setIssues(data);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
          <h1 className="text-3xl font-bold">Behavior Approval</h1>

          <p className="text-slate-500 mt-2">
            Review behavior issues waiting for manager approval.
          </p>
        </div>

        {issues.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No behavior issues waiting for approval.
          </Card>
        ) : (
          issues.map((issue) => (
            <Card
              key={issue.id}
              className="p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{issue.issue_type}</h2>

                <p className="text-slate-500 mt-2">
                  {issue.employees.full_name}
                  {" • "}
                  {issue.employees.department}
                </p>

                <p className="mt-3">{issue.description}</p>
              </div>

              <Button asChild className="cursor-pointer">
                <Link href={`/behavior/manager/${issue.id}`}>Open</Link>
              </Button>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
