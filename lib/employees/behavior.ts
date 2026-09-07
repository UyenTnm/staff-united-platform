import { getMyBehaviorActionUrl } from "../notifications";
import {
  createIssueWorkflow,
  type BaseIssue,
  type BaseIssueWithEmployee,
  type IssueStatus,
} from "./issue-workflow";

export type BehaviorIssue = BaseIssue;
export type BehaviorStatus = IssueStatus;
export type BehaviorWithEmployee = BaseIssueWithEmployee;

const workflow = createIssueWorkflow({
  table: "employee_behavior_issues",
  kind: "Behavior",
  notificationType: "behavior",
  reviewUrl: (id) => `/behavior/review/${id}`,
  managerUrl: (id) => `/behavior/manager/${id}`,
  myActionUrl: getMyBehaviorActionUrl,
  historyUrl: "/behavior/history",
  includeLockedAt: true,
  historyOrderColumn: "approved_at",
});

export async function getBehaviorIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  const issues = await workflow.getIssues(employeeId, reviewMonth);
  return issues as BehaviorIssue[];
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
  return workflow.createIssue(issue);
}

export function calculateBehaviorScore(issues: BehaviorIssue[]) {
  return workflow.calculateScore(issues);
}

export async function getBehaviorIssue(issueId: string) {
  const issue = await workflow.getIssue(issueId);
  return issue as BehaviorIssue;
}

export async function updateBehaviorIssue(
  issueId: string,
  values: {
    issue_type: string;
    description: string;
    deduction: number;
  },
) {
  return workflow.updateIssue(issueId, values);
}

export async function getBehaviorReview(issueId: string) {
  const issue = await workflow.getReview(issueId);
  return issue as BehaviorWithEmployee;
}

export async function getBehaviorIssuesByStatus(status: BehaviorStatus) {
  const issues = await workflow.getIssuesByStatus(status);
  return issues as BehaviorWithEmployee[];
}

export async function sendBehaviorToEmployee(id: string, employeeId: string) {
  return workflow.sendToEmployee(id, employeeId);
}

export async function getBehaviorHistory() {
  const issues = await workflow.getHistory();
  return issues as BehaviorWithEmployee[];
}

export async function getMyBehaviorIssues(
  employeeId: string,
  reviewMonth?: string,
) {
  return workflow.getMyIssues(employeeId, reviewMonth);
}

export async function employeeAcceptBehavior(issueId: string) {
  return workflow.employeeAccept(issueId);
}

export async function employeeAppealBehavior(id: string, comment: string) {
  return workflow.employeeAppeal(id, comment);
}

export async function sendBehaviorToManager(id: string) {
  return workflow.sendToManager(id);
}

export async function resolveBehaviorByHR(issueId: string) {
  return workflow.resolveAppeal(issueId);
}

export async function getBehaviorStatistics() {
  return workflow.getStatistics();
}

export async function approveBehavior(id: string) {
  return workflow.approve(id);
}

export async function lockBehavior(issueId: string) {
  return workflow.lock(issueId);
}
