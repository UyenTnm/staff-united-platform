import { supabase } from "@/lib/supabase";

export type ReviewStatus =
  | "Draft"
  | "WaitingEmployee"
  | "EmployeeAppealed"
  | "WaitingManager"
  | "Approved"
  | "Locked";

export interface PerformanceReview {
  id: string;

  employee_id: string;

  review_month: string;

  status: ReviewStatus;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}

export async function getReview(reviewId: string) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("id", reviewId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as PerformanceReview;
}

export async function getEmployeeReviews(employeeId: string) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .order("review_month", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as PerformanceReview[];
}

export async function getCurrentReview(employeeId: string) {
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("review_month", firstDay.toISOString().split("T")[0])
    .maybeSingle();

  if (error) throw error;

  return data;
}

// export async function createCurrentReview(employeeId: string) {
//   const now = new Date();

//   const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

//   return createPerformanceReview(
//     employeeId,
//     firstDay.toISOString().split("T")[0],
//   );
// }

export async function createPerformanceReview(
  employeeId: string,
  reviewMonth: string,
) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .insert({
      employee_id: employeeId,
      review_month: reviewMonth,
    })
    .select()
    .single();

  if (error) throw error;

  return data as PerformanceReview;
}

export async function updateReviewStatus(
  reviewId: string,
  status: ReviewStatus,
) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      status,
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function getOrCreateCurrentReview(
  employeeId: string,
): Promise<PerformanceReview> {
  const current = await getCurrentReview(employeeId);

  if (current) {
    return current;
  }

  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  return await createPerformanceReview(employeeId, firstDay);
}

export async function getReviewSummary(reviewId: string) {
  const review = await getReview(reviewId);

  if (!review) return null;

  return review;
}

export async function getReviewByMonth(
  employeeId: string,
  reviewMonth: string,
) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("review_month", reviewMonth)
    .maybeSingle();

  if (error) throw error;

  return data;
}
