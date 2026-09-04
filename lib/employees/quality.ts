import { supabase } from "../supabase";
import { getMyQualityActionUrl } from "../notifications";
import {
  createIssueWorkflow,
  type BaseIssue,
  type BaseIssueWithEmployee,
  type IssueStatus,
} from "./issue-workflow";

export type QualityIssue = BaseIssue;
export type QualityStatus = IssueStatus;
export type QualityWithEmployee = BaseIssueWithEmployee;

const workflow = createIssueWorkflow({
  table: "employee_quality_issues",
  kind: "Quality",
  notificationType: "quality",
  reviewUrl: (id) => `/quality/review/${id}`,
  managerUrl: (id) => `/quality/manager/${id}`,
  myActionUrl: getMyQualityActionUrl,
  historyUrl: "/quality/history",
  includeLockedAt: false,
  historyOrderColumn: "updated_at",
});

export async function getQualityIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  return workflow.getIssues(employeeId, reviewMonth) as Promise<QualityIssue[]>;
}

export function calculateQualityScore(issues: QualityIssue[]) {
  return workflow.calculateScore(issues);
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
  return workflow.createIssue(issue);
}

export async function getQualityIssue(id: string) {
  return workflow.getIssue(id) as Promise<QualityIssue>;
}

export async function updateQualityIssue(
  id: string,
  issue: {
    issue_type: string;
    description: string;
    deduction: number;
  },
) {
  return workflow.updateIssue(id, issue);
}

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
    .order("issue_date", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getQualityIssuesByStatus(status: QualityStatus) {
  return workflow.getIssuesByStatus(status) as Promise<QualityWithEmployee[]>;
}

export async function getResolvedQualityIssues() {
  return workflow.getHistory() as Promise<QualityWithEmployee[]>;
}

export async function resolveQualityIssue(id: string) {
  return workflow.resolveAppeal(id);
}

export async function sendQualityToEmployee(id: string, employeeId: string) {
  return workflow.sendToEmployee(id, employeeId);
}

export async function employeeAcceptQuality(issueId: string) {
  return workflow.employeeAccept(issueId);
}

export async function employeeAppealQuality(id: string, comment: string) {
  return workflow.employeeAppeal(id, comment);
}

export async function sendQualityToManager(id: string) {
  return workflow.sendToManager(id);
}

export async function approveQuality(id: string) {
  return workflow.approve(id);
}

export async function lockQuality(id: string) {
  return workflow.lock(id);
}

export async function getQualityStatistics() {
  return workflow.getStatistics();
}

export async function getQualityReview(issueId: string) {
  return workflow.getReview(issueId) as Promise<QualityWithEmployee>;
}

export async function getMyQualityIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  return workflow.getMyIssues(employeeId, reviewMonth);
}
