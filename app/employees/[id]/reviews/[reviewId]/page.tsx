"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReview, PerformanceReview } from "@/lib/perfomance/review";
import { ReviewCard } from "@/components/employees/performance/review-card";
import {
  calculateEmployeePerformance,
  type PerformanceSummary,
} from "@/lib/employees/performance";

export default function ReviewDetailPage() {
  const params = useParams();

  const [review, setReview] = useState<PerformanceReview | null>(null);

  const [performance, setPerformance] = useState<PerformanceSummary | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReview() {
      const data = await getReview(params.reviewId as string);

      if (!data) {
        setLoading(false);
        return;
      }

      setReview(data);

      const perf = await calculateEmployeePerformance(data.employee_id);

      setPerformance(perf);

      setLoading(false);
    }

    loadReview();
  }, [params.reviewId]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading Review...</div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div>Review not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href={`/employees/${params.id}`}>← Back to Reviews</Link>
        </Button>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">
                {new Date(review.review_month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                Review
              </h1>

              <p className="text-slate-500 mt-2">Performance Review</p>
              {performance && (
                <div className="mt-6">
                  <p className="text-sm text-slate-500">Current Performance</p>

                  <h2 className="text-5xl font-bold mt-2">
                    {performance.total} / 15
                  </h2>
                </div>
              )}
            </div>

            <div className="text-right">
              <Badge>{review.status}</Badge>

              {performance && (
                <p className="text-sm text-slate-500 mt-3">
                  Quality {performance.quality}/5
                  <br />
                  Behavior {performance.behavior}/5
                  <br />
                  Kaizen {performance.kaizen}/5
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-5">Review Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Review Month</p>

              <p className="font-medium">
                {new Date(review.review_month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>

              <p className="font-medium">{review.status}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Created</p>

              <p className="font-medium">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Last Updated</p>

              <p className="font-medium">
                {new Date(review.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-5">
          <ReviewCard
            title="Quality"
            score={performance?.quality ?? 5}
            maxScore={5}
            count={performance?.qualityIssues ?? 0}
            href={`/employees/${params.id}/quality?reviewId=${review.id}`}
            color="text-red-600"
          />

          <ReviewCard
            title="Behavior"
            score={performance?.behavior ?? 5}
            maxScore={5}
            count={performance?.behaviorIssues ?? 0}
            href={`/employees/${params.id}/behavior?reviewId=${review.id}`}
            color="text-amber-600"
          />

          <ReviewCard
            title="Kaizen"
            score={performance?.kaizen ?? 0}
            maxScore={5}
            count={0}
            href={`/employees/${params.id}/kaizen?reviewId=${review.id}`}
            color="text-emerald-600"
          />
        </div>

        {/* <Card className="p-6">
          <h2 className="text-xl font-semibold">Review Actions</h2>

          <div className="flex gap-3 mt-6">
            <Button>Quality</Button>

            <Button variant="outline">Behavior</Button>

            <Button variant="outline">Kaizen</Button>
          </div>
        </Card> */}

        {/* <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Review Management</h2>

          <div className="space-y-4">

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <h3 className="font-semibold">Quality</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Manage quality issues and deductions.
                </p>
              </div>

              <Button asChild>
                <Link href={`/employees/${params.id}/quality`}>Open</Link>
              </Button>
            </div>


            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <h3 className="font-semibold">Behavior</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Manage behavior issues and deductions.
                </p>
              </div>

              <Button asChild variant="outline">
                <Link href={`/employees/${params.id}/behavior`}>Open</Link>
              </Button>
            </div>


            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <h3 className="font-semibold">Kaizen</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Manage improvement records.
                </p>
              </div>

              <Button asChild variant="outline">
                <Link href={`/employees/${params.id}/kaizen`}>Open</Link>
              </Button>
            </div>
          </div>
        </Card> */}
      </div>
    </AppLayout>
  );
}
