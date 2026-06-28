import { ReviewStatus } from "./types";

export const REVIEW_WORKFLOW: Record<ReviewStatus, ReviewStatus[]> = {
  Draft: ["WaitingEmployee"],

  WaitingEmployee: ["EmployeeAppealed", "WaitingManager"],

  EmployeeAppealed: ["WaitingEmployee"],

  WaitingManager: ["Approved"],

  Approved: ["Locked"],

  Locked: [],
};

export function canTransition(current: ReviewStatus, next: ReviewStatus) {
  return REVIEW_WORKFLOW[current].includes(next);
}
