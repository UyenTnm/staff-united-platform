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

  status: QualityStatus;

  employee_comment: string | null;

  hr_note: string | null;

  manager_note: string | null;

  approved_by: string | null;

  approved_at: string | null;

  created_at: string;
}

export async function getQualityIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  let query = supabase
    .from("employee_quality_issues")
    .select("*")
    .eq("employee_id", employeeId);

  if (reviewMonth) {
    query = query.eq("review_month", reviewMonth);
  }

  const { data, error } = await query.order("issue_date", {
    ascending: false,
  });

  if (error) {
    console.log("Supabase Error:", JSON.stringify(error, null, 2));
    return [];
  }

  return data as QualityIssue[];
}

export function calculateQualityScore(issues: QualityIssue[]) {
  const startingScore = 5;

  const validIssues = issues.filter((issue) =>
    ["Waiting Manager", "Approved", "Locked"].includes(issue.status),
  );

  const totalDeduction = validIssues.reduce(
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
  const { error } = await supabase.from("employee_quality_issues").insert({
    ...issue,
    status: "Waiting Employee",
  });

  if (error) throw error;
}

export async function getQualityIssue(id: string) {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateQualityIssue(
  id: string,
  issue: {
    issue_type: string;
    description: string;
    deduction: number;
  },
) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update(issue)
    .eq("id", id);

  if (error) throw error;
}

export interface QualityWithEmployee extends QualityIssue {
  employees: {
    id: string;
    full_name: string;
    department: string;
  };
}

export type QualityStatus =
  | "Waiting Employee"
  | "Returned to HR"
  | "Resolved by HR"
  | "Waiting Manager"
  | "Approved"
  | "Locked";

export async function getAllQualityIssues() {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select(
      `
  *,
  employees!employee_quality_issues_employee_id_fkey(
    id,
    full_name,
    department
  ),
  evaluator:employees!employee_quality_issues_evaluator_id_fkey(
    id,
    full_name
  )
`,
    )
    .order("issue_date", {
      ascending: false,
    });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.log(JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

export async function getQualityIssuesByStatus(status: QualityStatus) {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select(
      `
      *,
      employees!employee_quality_issues_employee_id_fkey(
        id,
        full_name,
        department
      ),
      evaluator:employees!employee_quality_issues_evaluator_id_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("status", status)
    .order("issue_date", {
      ascending: false,
    });

  if (error) throw error;

  return data as QualityWithEmployee[];
}

export async function getResolvedQualityIssues() {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select(
      `
      *,
      employees!employee_quality_issues_employee_id_fkey(
        id,
        full_name,
        department
      ),
      evaluator:employees!employee_quality_issues_evaluator_id_fkey(
        id,
        full_name
      )
    `,
    )
    .in("status", ["Approved", "Locked"])
    .order("updated_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as QualityWithEmployee[];
}

export async function resolveQualityIssue(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Resolved by HR",
      deduction: 0,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function sendQualityToEmployee(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Waiting Employee",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function employeeAcceptQuality(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Waiting Manager",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function employeeAppealQuality(id: string, comment: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Returned to HR",
      employee_comment: comment,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function sendQualityToManager(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Waiting Manager",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function approveQuality(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function lockQuality(id: string) {
  const { error } = await supabase
    .from("employee_quality_issues")
    .update({
      status: "Locked",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getQualityStatistics() {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select("status");

  if (error) throw error;

  return {
    waitingEmployee: data.filter((i) => i.status === "Waiting Employee").length,

    returnedToHR: data.filter((i) => i.status === "Returned to HR").length,

    resolvedByHR: data.filter((i) => i.status === "Resolved by HR").length,

    waitingManager: data.filter((i) => i.status === "Waiting Manager").length,

    approved: data.filter((i) => i.status === "Approved").length,

    locked: data.filter((i) => i.status === "Locked").length,
  };
}

export async function getQualityReview(issueId: string) {
  const { data, error } = await supabase
    .from("employee_quality_issues")
    .select(
      `
      *,
      employees!employee_quality_issues_employee_id_fkey(
        id,
        full_name,
        department,
        role
      ),
      evaluator:employees!employee_quality_issues_evaluator_id_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("id", issueId)
    .single();

  if (error) throw error;

  return data as QualityWithEmployee;
}

export async function getMyQualityIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  let query = supabase
    .from("employee_quality_issues")
    .select("*")
    .eq("employee_id", employeeId);

  if (reviewMonth) {
    query = query.eq("review_month", reviewMonth);
  }

  const { data, error } = await query.order("issue_date", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}
