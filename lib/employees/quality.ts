import { supabase } from "../supabase";

export interface QualityIssue {
  id: string;

  employee_id: string;

  issue_type: string;

  description: string;

  deduction: number;

  evaluator_id: string | null;

  issue_date: string;

  review_month: string;

  created_at: string;
}

export async function getQualityIssues(employeeId: string) {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select("*")
    .eq("employee_id", employeeId)
    .order("issue_date", { ascending: false });

  if (error) {
    console.log("Supabase Error:", JSON.stringify(error, null, 2));
    return [];
  }

  return data as QualityIssue[];
}

export function calculateQualityScore(issues: QualityIssue[]) {
  const startingScore = 5;

  const totalDeduction = issues.reduce(
    (sum, issue) => sum + issue.deduction,
    0,
  );

  const currentScore = Math.max(startingScore - totalDeduction, 0);

  return {
    startingScore,
    totalDeduction,
    currentScore,
  };
}

export async function createQualityIssue(issue: {
  employee_id: string;
  issue_type: string;
  description: string;
  deduction: number;
  evaluator_id: string | null;
  issue_date: string;
  review_month: string;
}) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .insert(issue);

  if (error) {
    console.log("Supabase Error:", JSON.stringify(error, null, 2));
    console.error(error);
    throw error;
  }
}
