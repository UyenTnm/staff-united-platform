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
} from "@/lib/perfomance/review";

export default function PerformanceReviewsPage() {
  const router = useRouter();
  const params = useParams();

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getEmployeeReviews(params.id as string);
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

          <Button onClick={handleCurrentReview}>Current Review</Button>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// TẠM ẨN
