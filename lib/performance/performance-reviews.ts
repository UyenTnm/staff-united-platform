import { supabase } from "@/lib/supabase";

export type ReviewStatus =
  | "Draft"
  | "Submitted"
  | "Manager Review"
  | "Approved"
  | "Completed";

export interface PerformanceReview {
  id: string;

  employee_id: string;

  review_month: string;

  status: ReviewStatus;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}

export interface CreatePerformanceReviewInput {
  employee_id: string;

  review_month: string;

  status?: ReviewStatus;

  created_by?: string | null;
}

export async function getPerformanceReviews() {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .order("review_month", { ascending: false });

  if (error) throw error;

  return data as PerformanceReview[];
}

export async function getPerformanceReview(
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

  return data as PerformanceReview | null;
}

export async function createPerformanceReview(
  values: CreatePerformanceReviewInput,
) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .insert({
      employee_id: values.employee_id,
      review_month: values.review_month,
      status: values.status ?? "Draft",
      created_by: values.created_by ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as PerformanceReview;
}

export async function updatePerformanceReview(
  id: string,
  values: Partial<PerformanceReview>,
) {
  const { error } = await supabase
    .from("performance_reviews")
    .update(values)
    .eq("id", id);

  if (error) throw error;
}
