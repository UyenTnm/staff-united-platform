"use client";

import { useEffect, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";

import {
  getQualityIssuesByStatus,
  QualityWithEmployee,
} from "@/lib/employees/quality";

import {
  getBehaviorIssuesByStatus,
  BehaviorWithEmployee,
} from "@/lib/employees/behavior";

export default function ReturnedReviewsPage() {
  const [tab, setTab] = useState<"quality" | "behavior">("quality");

  const [quality, setQuality] = useState<QualityWithEmployee[]>([]);
  const [behavior, setBehavior] = useState<BehaviorWithEmployee[]>([]);

  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [qualityData, behaviorData] = await Promise.all([
        getQualityIssuesByStatus("Returned to HR"),
        getBehaviorIssuesByStatus("Returned to HR"),
      ]);

      setQuality(qualityData);
      setBehavior(behaviorData);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Returned Reviews</h1>

          <p className="text-slate-500 mt-2">
            Employee appeals waiting for HR review.
          </p>
        </div>

        {/* Tabs */}

        <div className="flex gap-3">
          <Button
            variant={tab === "quality" ? "default" : "outline"}
            onClick={() => setTab("quality")}
          >
            Quality ({quality.length})
          </Button>

          <Button
            variant={tab === "behavior" ? "default" : "outline"}
            onClick={() => setTab("behavior")}
          >
            Behavior ({behavior.length})
          </Button>
        </div>

        {loading ? (
          <Card className="p-6">Loading...</Card>
        ) : tab === "quality" ? (
          <div className="space-y-4">
            {quality.length === 0 ? (
              <Card className="p-6">No Quality Appeals.</Card>
            ) : (
              quality.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{issue.employees.full_name}</p>

                    <p className="text-sm text-slate-500">
                      {issue.employees.department}
                    </p>

                    <p className="mt-2">{issue.issue_type}</p>

                    {issue.employee_comment && (
                      <p className="mt-2 text-sm text-amber-700">
                        {issue.employee_comment}
                      </p>
                    )}
                  </div>

                  <Button asChild>
                    <Link href={`/quality/review/${issue.id}`}>Open</Link>
                  </Button>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {behavior.length === 0 ? (
              <Card className="p-6">No Behavior Appeals.</Card>
            ) : (
              behavior.map((issue) => (
                <Card
                  key={issue.id}
                  className="p-5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{issue.employees.full_name}</p>

                    <p className="text-sm text-slate-500">
                      {issue.employees.department}
                    </p>

                    <p className="mt-2">{issue.issue_type}</p>

                    {issue.employee_comment && (
                      <p className="mt-2 text-sm text-amber-700">
                        {issue.employee_comment}
                      </p>
                    )}
                  </div>

                  <Button asChild>
                    <Link href={`/behavior/review/${issue.id}`}>Open</Link>
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
