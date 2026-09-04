"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { EmployeeHeader } from "@/components/employees/employee-header";
import { ScoreBar } from "@/components/performance/score-bar";

import { getEmployee, type Employee } from "@/lib/employees/employees";
import {
  calculateReviewScores,
  type ReviewScores,
} from "@/lib/performance/engine";
import {
  getCurrentReview,
  type PerformanceReview,
} from "@/lib/performance/review";
import { RoleGuard } from "@/components/auth/role-guard";

function PerformanceSummaryPageContent() {
  const params = useParams();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [performance, setPerformance] = useState<ReviewScores | null>(null);
  const [review, setReview] = useState<PerformanceReview | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [employeeData, performanceData, reviewData] = await Promise.all([
        getEmployee(params.id as string),
        calculateReviewScores(params.id as string),
        getCurrentReview(params.id as string),
      ]);

      setEmployee(employeeData);
      setPerformance(performanceData);
      setReview(reviewData);

      setLoading(false);
    }

    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading Performance Summary...</div>
      </AppLayout>
    );
  }

  if (!employee || !performance) {
    return (
      <AppLayout>
        <div>Performance Summary not found.</div>
      </AppLayout>
    );
  }

  const reviewMonthLabel = review
    ? new Date(review.review_month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <EmployeeHeader
          employee={employee}
          title="Performance Summary"
          backHref={`/employees/${employee.id}`}
        />

        {/* Overview */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Monthly Bonus</p>

              <h2 className="text-2xl font-bold mt-1">{reviewMonthLabel}</h2>
            </div>

            {review && <Badge className="capitalize">{review.status}</Badge>}
          </div>

          <div className="mt-6">
            <ScoreBar
              label="Total Performance"
              score={performance.total}
              max={15}
              size="lg"
              helper={`${((performance.total / 15) * 100).toFixed(1)}% of the maximum 15% monthly bonus`}
            />
          </div>
        </Card>

        {/* Breakdown */}
        <div className="grid md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-4">
            <ScoreBar
              label="Quality"
              score={performance.quality}
              max={5}
              helper={
                performance.qualityIssues === 0
                  ? "No quality issues recorded"
                  : `${performance.qualityIssues} issue${performance.qualityIssues !== 1 ? "s" : ""} recorded this month`
              }
            />

            <Button asChild variant="outline" className="w-full">
              <Link href={`/employees/${employee.id}/quality`}>
                View Quality Issues
              </Link>
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <ScoreBar
              label="Behavior"
              score={performance.behavior}
              max={5}
              helper={
                performance.behaviorIssues === 0
                  ? "No behavior issues recorded"
                  : `${performance.behaviorIssues} issue${performance.behaviorIssues !== 1 ? "s" : ""} recorded this month`
              }
            />

            <Button asChild variant="outline" className="w-full">
              <Link href={`/employees/${employee.id}/behavior`}>
                View Behavior Issues
              </Link>
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <ScoreBar
              label="Kaizen"
              score={performance.kaizen}
              max={5}
              helper={
                performance.rewardedKaizens === 0
                  ? "No rewarded kaizens yet"
                  : `${performance.rewardedKaizens} kaizen${performance.rewardedKaizens !== 1 ? "s" : ""} rewarded this month`
              }
            />

            <Button asChild variant="outline" className="w-full">
              <Link href={`/employees/${employee.id}/kaizen`}>
                View Kaizens
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function PerformanceSummaryPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <PerformanceSummaryPageContent />
    </RoleGuard>
  );
}
