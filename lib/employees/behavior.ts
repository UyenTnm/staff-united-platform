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
  status: BehaviorStatus;
  created_at: string;
}

export type BehaviorStatus =
  | "Waiting Employee"
  | "Employee Appealed"
  | "Waiting Manager"
  | "Approved"
  | "Locked";

export interface BehaviorWithEmployee extends BehaviorIssue {
  employees: {
    id: string;
    full_name: string;
    department: string;
  };

  evaluator?: {
    id: string;
    full_name: string;
  } | null;
}

export async function getBehaviorIssues(employeeId: string) {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .select(
      `
  *,
  employees!employee_behavior_issues_employee_id_fkey(
    id,
    full_name,
    department
  ),
  evaluator:employees!employee_behavior_issues_evaluator_id_fkey(
    id,
    full_name
  )
`,
    )
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

export async function getBehaviorIssuesByStatus(status: BehaviorStatus) {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .select(
      `
      *,
      employees!employee_behavior_issues_employee_id_fkey(
        id,
        full_name,
        department
      ),
      evaluator:employees!employee_behavior_issues_evaluator_id_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("status", status)
    .order("issue_date", {
      ascending: false,
    });

  console.log("Behavior DATA:", data);
  console.log("Behavior ERROR:", error);

  if (error) {
    console.log(JSON.stringify(error, null, 2));
    throw error;
  }

  return data as BehaviorWithEmployee[];
}
