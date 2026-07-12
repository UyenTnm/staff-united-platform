import { supabase } from "@/lib/supabase";

import { createPerformanceReview } from "./review";

export interface ReviewCycle {
  reviewMonth: string;
  reviews: number;
  completedReviews: number;
  totalEmployees: number;
  completed: boolean;
}

export async function createMonthlyReviewCycle(reviewMonth: string) {
  // Lấy toàn bộ nhân viên Active
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id")
    .eq("status", "Active");

  if (error) throw error;

  let created = 0;
  let skipped = 0;

  for (const employee of employees ?? []) {
    const { data: existing } = await supabase
      .from("performance_reviews")
      .select("id")
      .eq("employee_id", employee.id)
      .eq("review_month", reviewMonth)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    await createPerformanceReview(employee.id, reviewMonth);

    created++;
  }

  return {
    created,
    skipped,
    total: employees?.length ?? 0,
  };
}

export function getUpcomingReviewMonths() {
  const months: string[] = [];

  const current = new Date();

  for (let i = 1; i <= 3; i++) {
    const next = new Date(current.getFullYear(), current.getMonth() + i, 1);

    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, "0");

    months.push(`${year}-${month}-01`);
  }

  return months;
}

export async function getReviewCycles() {
  // Tổng số nhân viên Active
  const { count: totalEmployees } = await supabase
    .from("employees")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "Active");

  // Lấy toàn bộ review
  const { data, error } = await supabase
    .from("performance_reviews")
    .select("review_month,status");

  if (error) throw error;

  const grouped = new Map<string, ReviewCycle>();

  for (const review of data ?? []) {
    if (!grouped.has(review.review_month)) {
      grouped.set(review.review_month, {
        reviewMonth: review.review_month,
        reviews: 0,
        completedReviews: 0,
        totalEmployees: totalEmployees ?? 0,
        completed: false,
      });
    }

    const cycle = grouped.get(review.review_month)!;

    cycle.reviews++;

    if (review.status === "Approved" || review.status === "Locked") {
      cycle.completedReviews++;
    }
  }

  // cập nhật completed
  grouped.forEach((item) => {
    item.completed = item.completedReviews >= item.totalEmployees;
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.reviewMonth.localeCompare(b.reviewMonth),
  );
}
