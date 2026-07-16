import { supabase } from "@/lib/supabase";
import { createNotification, getMyBehaviorActionUrl } from "../notifications";

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

  employee_comment: string | null;
  hr_note: string | null;
  manager_note: string | null;

  approved_by: string | null;
  approved_at: string | null;

  created_at: string;
  updated_at: string;
}

export type BehaviorStatus =
  | "Waiting Employee"
  | "Returned to HR"
  | "Resolved by HR"
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

export async function getBehaviorIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  let query = supabase
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
    .eq("employee_id", employeeId);

  if (reviewMonth) {
    query = query.eq("review_month", reviewMonth);
  }

  const { data, error } = await query.order("issue_date", {
    ascending: false,
  });

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
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .insert({
      ...issue,
      status: "Waiting Employee",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export function calculateBehaviorScore(issues: BehaviorIssue[]) {
  const startingScore = 5;

  const validIssues = issues.filter((issue) =>
    ["Waiting Manager", "Approved", "Locked"].includes(issue.status),
  );

  const totalDeduction = validIssues.reduce(
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

export async function getBehaviorReview(issueId: string) {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
    .select(
      `
      *,
      employees!employee_behavior_issues_employee_id_fkey(
        id,
        full_name,
        department,
        role
      ),
      evaluator:employees!employee_behavior_issues_evaluator_id_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("id", issueId)
    .single();

  if (error) throw error;

  return data as BehaviorWithEmployee;
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

export async function sendBehaviorToEmployee(id: string, employeeId: string) {
  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Waiting Employee",
    })
    .eq("id", id);

  if (error) throw error;

  await createNotification(
    employeeId,
    "New Behavior Review",
    "HR has sent a Behavior issue for your review.",
    "behavior",
    getMyBehaviorActionUrl(id),
  );
}

export async function getBehaviorHistory() {
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
    .in("status", ["Approved", "Locked"])
    .order("approved_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as BehaviorWithEmployee[];
}

export async function getMyBehaviorIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  let query = supabase
    .from("employee_behavior_issues")
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

export async function employeeAcceptBehavior(issueId: string) {
  const issue = await getBehaviorIssue(issueId);

  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Waiting Manager",
    })
    .eq("id", issueId);

  if (error) throw error;

  const { data: managers } = await supabase
    .from("employees")
    .select("id")
    .eq("user_role", "Manager");

  if (managers) {
    for (const manager of managers) {
      await createNotification(
        manager.id,
        "Behavior Review Waiting",
        `${issue.issue_type} is waiting for your approval.`,
        "behavior",
        `/behavior/manager/${issueId}`,
      );
    }
  }
}

export async function employeeAppealBehavior(id: string, comment: string) {
  const issue = await getBehaviorIssue(id);

  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Returned to HR",
      employee_comment: comment,
    })
    .eq("id", id);

  if (error) throw error;

  // tìm tất cả HR
  const { data: hrUsers } = await supabase
    .from("employees")
    .select("id")
    .eq("user_role", "HR");

  if (hrUsers) {
    for (const hr of hrUsers) {
      await createNotification(
        hr.id,
        "Behavior Appeal Submitted",
        "An employee has submitted an appeal for a Behavipr Issue.",
        "behavior",
        `/behavior/review/${id}`,
      );
    }
  }
}

// export async function sendBehaviorToManager(issueId: string) {
//   const { error } = await supabase
//     .from("employee_behavior_issues")
//     .update({
//       status: "Waiting Manager",
//     })
//     .eq("id", issueId);

//   if (error) throw error;
// }

export async function sendBehaviorToManager(id: string) {
  const issue = await getBehaviorReview(id);

  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Waiting Manager",
    })
    .eq("id", id);

  if (error) throw error;

  const { data: managers } = await supabase
    .from("employees")
    .select("id")
    .eq("user_role", "Manager");

  if (managers) {
    for (const manager of managers) {
      await createNotification(
        manager.id,
        "Behavior Review Waiting",
        `${issue.employees.full_name}'s Behavior Review is waiting for your approval.`,
        "behavior",
        `/behavior/manager/${id}`,
      );
    }
  }
}

export async function resolveBehaviorByHR(issueId: string) {
  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Resolved by HR",
      deduction: 0,
    })
    .eq("id", issueId);

  if (error) throw error;
}

export async function getBehaviorStatistics() {
  const { data, error } = await supabase
    .from("employee_behavior_issues")
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

export async function approveBehavior(id: string) {
  const issue = await getBehaviorReview(id);

  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  // Employee
  await createNotification(
    issue.employee_id,
    "Behavior Review Approved",
    "Your Behavior Review has been approved by the Manager.",
    "behavior",
    getMyBehaviorActionUrl(id),
  );

  // HR
  const { data: hrUsers } = await supabase
    .from("employees")
    .select("id")
    .eq("user_role", "HR");

  if (hrUsers) {
    for (const hr of hrUsers) {
      await createNotification(
        hr.id,
        "Behavior Review Approved",
        `${issue.employees.full_name}'s Behavior Review has been approved by the Manager.`,
        "quality",
        `/behavior/history`,
      );
    }
  }
}

export async function lockBehavior(issueId: string) {
  const { error } = await supabase
    .from("employee_behavior_issues")
    .update({
      status: "Locked",
      locked_at: new Date().toISOString(),
    })
    .eq("id", issueId);

  if (error) throw error;
}
