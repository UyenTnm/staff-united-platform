"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

import {
  getReviewByMonth,
  type MonthlyPerformanceReview,
} from "@/lib/performance/review";
import {
  calculateReviewScores,
  type ReviewScores,
} from "@/lib/performance/engine";

export default function MonthlyPerformanceDetailPage() {
  const params = useParams();

  const employeeId = params.employeeId as string;
  const reviewMonth = params.reviewMonth as string;

  const [loading, setLoading] = useState(true);

  const [review, setReview] = useState<MonthlyPerformanceReview | null>(null);

  const [scores, setScores] = useState<ReviewScores | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const reviewData = await getReviewByMonth(employeeId, reviewMonth);

        const scoreData = await calculateReviewScores(employeeId, reviewMonth);

        console.log("Review", reviewData);
        console.log("Scores", scoreData);

        setReview(reviewData);
        setScores(scoreData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [employeeId, reviewMonth]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Performance</h1>

          <p className="text-slate-500 mt-2">{review?.employees.full_name}</p>

          <p className="text-sm text-slate-400 mt-1">
            {review?.employees.department}
            {/* {" • "} */}
            {review?.employees.role}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-5">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Quality</p>

          <h2 className="text-3xl font-bold mt-3">{scores?.quality}/5</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Behavior</p>

          <h2 className="text-3xl font-bold mt-3">{scores?.behavior}/5</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Kaizen</p>

          <h2 className="text-3xl font-bold mt-3">{scores?.kaizen}/5</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Performance</p>

          <h2 className="text-3xl font-bold mt-3">{scores?.total}/15</h2>
        </Card>
      </div>
    </AppLayout>
  );
}
