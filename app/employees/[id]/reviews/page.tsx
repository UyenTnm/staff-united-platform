"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getEmployeeReviews,
  getOrCreateCurrentReview,
  PerformanceReview,
} from "@/lib/performance/review";
import { generateMonthlyReviews } from "@/lib/performance/monthly-review";
import { toast } from "sonner";

export default function PerformanceReviewsPage() {
  const router = useRouter();
  const params = useParams();

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getEmployeeReviews(params.id as string);

        console.log("Reviews:", data);

        setReviews(data);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [params.id]);

  async function handleCurrentReview() {
    const review = await getOrCreateCurrentReview(params.id as string);

    router.push(`/employees/${params.id}/reviews/${review.id}`);
  }

  async function handleGenerateReviews() {
    try {
      const result = await generateMonthlyReviews();

      toast.success(
        `${result.created} reviews created • ${result.skipped} already existed`,
      );

      const data = await getEmployeeReviews(params.id as string);

      setReviews(data);
    } catch (error) {
      console.error(error);

      toast.error("Unable to generate monthly reviews.");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading reviews...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Reviews</h1>

            <p className="text-slate-500 mt-2">
              Monthly performance history for this employee.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGenerateReviews}>
              Start New Review Cycle
            </Button>

            <Button onClick={handleCurrentReview}>Current Review</Button>
          </div>{" "}
        </div>

        {reviews.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-slate-500">No performance reviews yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {new Date(review.review_month).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Status : {review.status}
                    </p>
                  </div>

                  <Button asChild variant="outline">
                    <Link href={`/employees/${params.id}/reviews/${review.id}`}>
                      Open Review
                    </Link>
                  </Button>
                </div>

                <Card className="p-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Total Reviews</p>

                      <h2 className="text-3xl font-bold">{reviews.length}</h2>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Draft</p>

                      <h2 className="text-3xl font-bold">
                        {reviews.filter((r) => r.status === "Draft").length}
                      </h2>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Approved</p>

                      <h2 className="text-3xl font-bold">
                        {reviews.filter((r) => r.status === "Approved").length}
                      </h2>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Locked</p>

                      <h2 className="text-3xl font-bold">
                        {reviews.filter((r) => r.status === "Locked").length}
                      </h2>
                    </div>
                  </div>
                </Card>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
