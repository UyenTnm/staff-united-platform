import { supabase } from "@/lib/supabase";
import { calculateReviewScores } from "./engine";
import { getReviewMonth } from "@/lib/employees/bonus";

export interface EmployeePerformanceRow {
  employeeId: string;
  fullName: string;
  department: string;
  role: string;

  quality: number;
  behavior: number;
  kaizen: number;
  total: number;

  qualityIssues: number;
  behaviorIssues: number;
  rewardedKaizens: number;
}

/**
 * One row per active employee, scores for the given month (defaults to
 * the current month). Used by the "Performance Overview" table so HR /
 * Managers can see everyone's Quality/Behavior/Kaizen/Total at a glance
 * without opening each employee individually.
 */
export async function getPerformanceOverview(
  reviewMonth: string = getReviewMonth(new Date()),
): Promise<EmployeePerformanceRow[]> {
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, full_name, department, role")
    .eq("status", "Active")
    .order("full_name", { ascending: true });

  if (error) throw error;

  const rows = await Promise.all(
    (employees ?? []).map(async (employee) => {
      const scores = await calculateReviewScores(employee.id, reviewMonth);

      return {
        employeeId: employee.id,
        fullName: employee.full_name,
        department: employee.department,
        role: employee.role,

        quality: scores.quality,
        behavior: scores.behavior,
        kaizen: scores.kaizen,
        total: scores.total,

        qualityIssues: scores.qualityIssues,
        behaviorIssues: scores.behaviorIssues,
        rewardedKaizens: scores.rewardedKaizens,
      };
    }),
  );

  return rows;
}
