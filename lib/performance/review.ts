import { supabase } from "@/lib/supabase";

export type ReviewStatus =
  | "Draft"
  | "WaitingEmployee"
  | "EmployeeAppealed"
  | "WaitingManager"
  | "Approved"
  | "Locked";

function getCurrentReviewMonth() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export interface PerformanceReview {
  id: string;

  employee_id: string;

  review_month: string;

  status: ReviewStatus;

  created_by: string | null;

  /**
   * Review Notes
   */
  hr_notes: string | null;

  manager_notes: string | null;

  employee_comment: string | null;

  approved_at: string | null;

  /**
   * Audit
   */
  created_at: string;

  updated_at: string;
}

export interface ManagerReview extends PerformanceReview {
  employees: {
    id: string;
    full_name: string;
    department: string;
    role: string;
  };
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
  const reviewMonth = getCurrentReviewMonth();

  const { data, error } = await supabase
    .from("performance_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("review_month", reviewMonth)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getCurrentReviewByEmployee(employeeId: string) {
  return await getCurrentReview(employeeId);
}

export async function createPerformanceReview(
  employeeId: string,
  reviewMonth: string,
) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .insert({
      employee_id: employeeId,

      review_month: reviewMonth,

      status: "Draft",

      hr_notes: null,

      manager_notes: null,

      employee_comment: null,

      approved_at: null,
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

export async function updateHrNotes(reviewId: string, notes: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      hr_notes: notes,
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function updateEmployeeComment(reviewId: string, comment: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      employee_comment: comment,
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

  const reviewMonth = getCurrentReviewMonth();

  try {
    return await createPerformanceReview(employeeId, reviewMonth);
  } catch {
    const existing = await getReviewByMonth(employeeId, reviewMonth);

    if (existing) {
      return existing as PerformanceReview;
    }

    throw new Error("Unable to create review.");
  }
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

export async function employeeAcceptReview(reviewId: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      status: "WaitingManager",
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function getWaitingManagerReviews() {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select(
      `
      *,
      employees (
        id,
        full_name,
        department,
        role
      )
    `,
    )
    .eq("status", "WaitingManager")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as ManagerReview[];
}

export async function updateManagerNotes(reviewId: string, notes: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      manager_notes: notes,
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function approveReview(reviewId: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      status: "Approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function lockReview(reviewId: string) {
  const { error } = await supabase
    .from("performance_reviews")
    .update({
      status: "Locked",
    })
    .eq("id", reviewId);

  if (error) throw error;
}
