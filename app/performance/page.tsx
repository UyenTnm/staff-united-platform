"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/components/auth/auth-provider";

import {
  employeeAcceptReview,
  getCurrentReviewByEmployee,
  PerformanceReview,
} from "@/lib/performance/review";

import {
  calculateReviewScores,
  type ReviewScores,
} from "@/lib/performance/engine";
import { RoleGuard } from "@/components/auth/role-guard";
import { toast } from "sonner";

export default function MyPerformancePage() {
  const { employee } = useAuth();

  const [review, setReview] = useState<PerformanceReview | null>(null);

  const [performance, setPerformance] = useState<ReviewScores | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employee) return;

      const currentReview = await getCurrentReviewByEmployee(employee.id);

      setReview(currentReview);

      if (currentReview) {
        const perf = await calculateReviewScores(employee.id);

        setPerformance(perf);
      }

      setLoading(false);
    }

    loadData();
  }, [employee]);

  async function handleAcceptReview() {
    if (!review) return;

    try {
      await employeeAcceptReview(review.id);

      setReview({
        ...review,
        status: "WaitingManager",
      });

      toast.success("Review accepted successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Unable to accept review.");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <Card className="p-8">
          <h2 className="text-2xl font-bold">My Performance Review</h2>

          <p className="text-slate-500 mt-3">
            No review available for this month.
          </p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <RoleGuard allow={["Employee", "HR"]}>
      <AppLayout>
        <div className="space-y-6">
          <Card className="p-6">
            <h1 className="text-3xl font-bold">My Performance Review</h1>

            <p className="text-slate-500 mt-2">
              {new Date(review.review_month).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Status: {review.status}
            </p>
          </Card>

          {performance && (
            <Card className="p-6">
              <h2 className="text-5xl font-bold">{performance.total} / 15</h2>

              <div className="mt-6 space-y-2">
                <p>Quality : {performance.quality}/5</p>

                <p>Behavior : {performance.behavior}/5</p>

                <p>Kaizen : {performance.kaizen}/5</p>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Kaizens</h2>

                <p className="text-slate-500 mt-2">
                  Submit your improvement ideas and track their approval status.
                </p>
              </div>

              <Button asChild>
                <Link href="/performance/kaizen">View My Kaizens</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptReview}
                disabled={review.status !== "WaitingEmployee"}
              >
                Accept Review
              </Button>

              <Button variant="outline">Appeal</Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
