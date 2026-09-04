import { supabase } from "@/lib/supabase";
import { createNotification } from "../notifications";

export type IssueStatus =
  | "Waiting Employee"
  | "Returned to HR"
  | "Resolved by HR"
  | "Waiting Manager"
  | "Approved"
  | "Locked";

export interface BaseIssue {
  id: string;
  employee_id: string;
  issue_type: string;
  description: string;
  deduction: number;
  evaluator_id: string | null;
  issue_date: string;
  review_month: string;
  status: IssueStatus;
  employee_comment: string | null;
  hr_note: string | null;
  manager_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface BaseIssueWithEmployee extends BaseIssue {
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

interface IssueWorkflowConfig {
  table: "employee_quality_issues" | "employee_behavior_issues";
  kind: "Quality" | "Behavior";
  notificationType: "quality" | "behavior";
  reviewUrl: (id: string) => string;
  managerUrl: (id: string) => string;
  myActionUrl: (id: string) => string;
  historyUrl: string;
  includeLockedAt: boolean;
  historyOrderColumn: "approved_at" | "updated_at";
}

/**
 * Tạo bộ hàm nghiệp vụ dùng chung cho Quality và Behavior.
 * Cả 2 module dùng chung logic này — chỉ khác nhau ở tên bảng và vài đường link.
 * Sửa nghiệp vụ ở đây sẽ áp dụng đồng thời cho cả Quality lẫn Behavior.
 */
export function createIssueWorkflow(config: IssueWorkflowConfig) {
  const {
    table,
    kind,
    notificationType,
    reviewUrl,
    managerUrl,
    myActionUrl,
    historyUrl,
    includeLockedAt,
    historyOrderColumn,
  } = config;

  const employeeJoin = `
    *,
    employees!${table}_employee_id_fkey(
      id,
      full_name,
      department
    ),
    evaluator:employees!${table}_evaluator_id_fkey(
      id,
      full_name
    )
  `;

  const employeeJoinWithRole = `
    *,
    employees!${table}_employee_id_fkey(
      id,
      full_name,
      department,
      role
    ),
    evaluator:employees!${table}_evaluator_id_fkey(
      id,
      full_name
    )
  `;

  async function getIssues(employeeId: string, reviewMonth?: string) {
    let query = supabase.from(table).select("*").eq("employee_id", employeeId);

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

    return data as BaseIssue[];
  }

  async function getMyIssues(employeeId: string, reviewMonth?: string) {
    let query = supabase.from(table).select("*").eq("employee_id", employeeId);

    if (reviewMonth) {
      query = query.eq("review_month", reviewMonth);
    }

    const { data, error } = await query.order("issue_date", {
      ascending: false,
    });

    if (error) throw error;

    return data;
  }

  function calculateScore(issues: BaseIssue[]) {
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

  async function createIssue(issue: {
    employee_id: string;
    issue_type: string;
    description: string;
    deduction: number;
    evaluator_id: string | null;
    issue_date: string;
    review_month: string;
  }) {
    const { data, error } = await supabase
      .from(table)
      .insert({
        ...issue,
        status: "Waiting Employee",
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async function getIssue(id: string) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as BaseIssue;
  }

  async function updateIssue(
    id: string,
    values: {
      issue_type: string;
      description: string;
      deduction: number;
    },
  ) {
    const { error } = await supabase.from(table).update(values).eq("id", id);

    if (error) throw error;
  }

  async function getReview(id: string) {
    const { data, error } = await supabase
      .from(table)
      .select(employeeJoinWithRole)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as unknown as BaseIssueWithEmployee;
  }

  async function getIssuesByStatus(status: IssueStatus) {
    const { data, error } = await supabase
      .from(table)
      .select(employeeJoin)
      .eq("status", status)
      .order("issue_date", { ascending: false });

    if (error) throw error;

    return data as unknown as BaseIssueWithEmployee[];
  }

  async function getHistory() {
    const { data, error } = await supabase
      .from(table)
      .select(employeeJoin)
      .in("status", ["Approved", "Locked", "Resolved by HR"])
      .order(historyOrderColumn, { ascending: false });

    if (error) throw error;

    return data as unknown as BaseIssueWithEmployee[];
  }

  async function getStatistics() {
    const { data, error } = await supabase.from(table).select("status");

    if (error) throw error;

    return {
      waitingEmployee: data.filter((i) => i.status === "Waiting Employee")
        .length,
      returnedToHR: data.filter((i) => i.status === "Returned to HR").length,
      resolvedByHR: data.filter((i) => i.status === "Resolved by HR").length,
      waitingManager: data.filter((i) => i.status === "Waiting Manager").length,
      approved: data.filter((i) => i.status === "Approved").length,
      locked: data.filter((i) => i.status === "Locked").length,
    };
  }

  async function sendToEmployee(id: string, employeeId: string) {
    const { error } = await supabase
      .from(table)
      .update({ status: "Waiting Employee" })
      .eq("id", id);

    if (error) throw error;

    await createNotification(
      employeeId,
      `New ${kind} Review`,
      `HR has sent a ${kind} issue for your review.`,
      notificationType,
      myActionUrl(id),
    );
  }

  async function employeeAccept(issueId: string) {
    const issue = await getIssue(issueId);

    const { error } = await supabase
      .from(table)
      .update({ status: "Waiting Manager" })
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
          `${kind} Review Waiting`,
          `${issue.issue_type} is waiting for your approval.`,
          notificationType,
          managerUrl(issueId),
        );
      }
    }
  }

  async function employeeAppeal(id: string, comment: string) {
    const issue = await getIssue(id);

    const { error } = await supabase
      .from(table)
      .update({
        status: "Returned to HR",
        employee_comment: comment,
      })
      .eq("id", id);

    if (error) throw error;

    const { data: hrUsers } = await supabase
      .from("employees")
      .select("id")
      .eq("user_role", "HR");

    if (hrUsers) {
      for (const hr of hrUsers) {
        await createNotification(
          hr.id,
          `${kind} Appeal Submitted`,
          `${issue.issue_type} has been appealed by ${issue.employee_id === issue.employee_id ? "the employee" : ""}.`,
          notificationType,
          reviewUrl(id),
        );
      }
    }
  }

  async function sendToManager(id: string) {
    const issue = await getReview(id);

    const { error } = await supabase
      .from(table)
      .update({ status: "Waiting Manager" })
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
          `${kind} Review Waiting`,
          `${issue.employees.full_name}'s ${kind} Review is waiting for your approval.`,
          notificationType,
          managerUrl(id),
        );
      }
    }
  }

  async function resolveAppeal(id: string) {
    const issue = await getIssue(id);

    const { error } = await supabase
      .from(table)
      .update({
        status: "Resolved by HR",
        deduction: 0,
      })
      .eq("id", id);

    if (error) throw error;

    await createNotification(
      issue.employee_id,
      "Appeal Accepted",
      `Your appeal for "${issue.issue_type}" has been accepted. The deduction has been removed.`,
      notificationType,
      myActionUrl(id),
    );
  }

  async function approve(id: string) {
    const issue = await getReview(id);

    const { error } = await supabase
      .from(table)
      .update({
        status: "Approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    await createNotification(
      issue.employee_id,
      `${kind} Review Approved`,
      `Your ${kind} Review has been approved by the Manager.`,
      notificationType,
      myActionUrl(id),
    );

    const { data: hrUsers } = await supabase
      .from("employees")
      .select("id")
      .eq("user_role", "HR");

    if (hrUsers) {
      for (const hr of hrUsers) {
        await createNotification(
          hr.id,
          `${kind} Review Approved`,
          `${issue.employees.full_name}'s ${kind} Review has been approved by the Manager.`,
          notificationType,
          historyUrl,
        );
      }
    }
  }

  async function lock(id: string) {
    const values: Record<string, unknown> = { status: "Locked" };

    if (includeLockedAt) {
      values.locked_at = new Date().toISOString();
    }

    const { error } = await supabase.from(table).update(values).eq("id", id);

    if (error) throw error;
  }

  return {
    getIssues,
    getMyIssues,
    calculateScore,
    createIssue,
    getIssue,
    updateIssue,
    getReview,
    getIssuesByStatus,
    getHistory,
    getStatistics,
    sendToEmployee,
    employeeAccept,
    employeeAppeal,
    sendToManager,
    resolveAppeal,
    approve,
    lock,
  };
}
