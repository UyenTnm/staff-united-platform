import { supabase } from "@/lib/supabase";
import { getReviewByMonth, createPerformanceReview } from "./review";

function getCurrentReviewMonth() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export async function generateMonthlyReviews() {
  const reviewMonth = getCurrentReviewMonth();

  const { data: employees, error } = await supabase
    .from("employees")
    .select("id,status")
    .eq("status", "Active");

  if (error) throw error;

  let created = 0;
  let skipped = 0;

  for (const employee of employees) {
    const existing = await getReviewByMonth(employee.id, reviewMonth);

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
  };
}
