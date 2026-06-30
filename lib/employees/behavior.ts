import { supabase } from "@/lib/supabase";

export interface BehaviorIssue {
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

export async function getBehaviorIssues(employeeId: string) {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .select("*")
    .eq("employee_id", employeeId)
    .order("issue_date", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as BehaviorIssue[];
}

export async function createBehaviorIssue(issue: {
  employee_id: string;
  issue_type: string;
  description: string;
  deduction: number;
  evaluator_id: string | null;
  issue_date: string;
  review_month: string;
}) {
  const { error } = await supabase
    .from("employee_behavior_issues")
    .insert(issue);

  if (error) {
    console.error(error);
    throw error;
  }
}

export function calculateBehaviorScore(issues: BehaviorIssue[]) {
  const startingScore = 5;

  const totalDeduction = issues.reduce(
    (sum, issue) => sum + issue.deduction,
    0,
  );

  return {
    startingScore,
    totalDeduction,
    currentScore: Math.max(startingScore - totalDeduction, 0),
  };
}

export async function getBehaviorIssue(issueId: string) {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .select("*")
    .eq("id", issueId)
    .single();

  if (error) throw error;

  return data as BehaviorIssue;
}

export async function updateBehaviorIssue(
  issueId: string,
  values: {
    issue_type: string;
    description: string;
    deduction: number;
  },
) {
  const { error } = await supabase
    .from("employee_behavior_issues")
    .update(values)
    .eq("id", issueId);

  if (error) throw error;
}
