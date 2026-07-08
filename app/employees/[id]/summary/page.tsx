"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getEmployee, type Employee } from "@/lib/employees/employees";
import {
  calculateReviewScores,
  type ReviewScores,
} from "@/lib/performance/engine";
import {
  getCurrentReview,
  type PerformanceReview,
} from "@/lib/performance/review";

export default function PerformanceSummaryPage() {
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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Summary</h1>

            <p className="text-slate-500 mt-2">{employee.full_name}</p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${employee.id}`}>Back to Employee</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

//  Backup or Delete later
