import { getReview, PerformanceReview } from "./review";

export interface ReviewDashboard {
  review: PerformanceReview;

  quality: number;

  behavior: number;

  kaizen: number;

  total: number;

  percentage: number;
}

export async function getReviewDashboard(
  reviewId: string,
): Promise<ReviewDashboard | null> {
  const review = await getReview(reviewId);

  if (!review) return null;

  return {
    review,

    quality: 5,

    behavior: 5,

    kaizen: 0,

    total: 10,

    percentage: 66.7,
  };
}
