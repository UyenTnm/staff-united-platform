import { getReview, PerformanceReview } from "./review";
import { calculateReviewScores } from "./engine";
import { supabase } from "../supabase";

export interface ReviewDashboard {
  review: PerformanceReview;

  quality: number;

  behavior: number;

  kaizen: number;

  total: number;

  percentage: number;
}

export interface MonthlyDashboard {
  currentCycle: string;

  totalEmployees: number;

  totalReviews: number;

  draft: number;

  waitingEmployee: number;

  waitingManager: number;

  approved: number;

  locked: number;

  progress: number;
}

export async function getReviewDashboard(
  reviewId: string,
): Promise<ReviewDashboard | null> {
  const review = await getReview(reviewId);

  if (!review) return null;

  const scores = await calculateReviewScores(review.employee_id);

  return {
    review,

    quality: scores.quality,

    behavior: scores.behavior,

    kaizen: scores.kaizen,

    total: scores.total,

    percentage: (scores.total / 15) * 100,
  };
}

export async function getMonthlyDashboard(): Promise<MonthlyDashboard> {
  const now = new Date();

  const reviewMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const [{ count: employeeCount }, { data: reviews }] = await Promise.all([
    supabase
      .from("employees")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "Active"),

    supabase
      .from("performance_reviews")
      .select("*")
      .eq("review_month", reviewMonth),
  ]);

  const totalReviews = reviews?.length ?? 0;

  const draft = reviews?.filter((r) => r.status === "Draft").length ?? 0;

  const waitingEmployee =
    reviews?.filter((r) => r.status === "WaitingEmployee").length ?? 0;

  const waitingManager =
    reviews?.filter((r) => r.status === "WaitingManager").length ?? 0;

  const approved = reviews?.filter((r) => r.status === "Approved").length ?? 0;

  const locked = reviews?.filter((r) => r.status === "Locked").length ?? 0;

  const progress =
    employeeCount && employeeCount > 0
      ? Math.round((locked / employeeCount) * 100)
      : 0;

  return {
    currentCycle: reviewMonth,

    totalEmployees: employeeCount ?? 0,

    totalReviews,

    draft,

    waitingEmployee,

    waitingManager,

    approved,

    locked,

    progress,
  };
}
