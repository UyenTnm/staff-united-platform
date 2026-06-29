export type ReviewStatus =
  | "Draft"
  | "WaitingEmployee"
  | "EmployeeAppealed"
  | "WaitingManager"
  | "Approved"
  | "Locked";

export interface PerformanceReview {
  id: string;

  employeeId: string;

  reviewMonth: string;

  status: ReviewStatus;

  qualityScore: number;

  behaviorScore: number;

  kaizenScore: number;

  totalScore: number;

  employeeComment?: string;

  managerComment?: string;

  createdBy: string;

  approvedBy?: string;

  approvedAt?: string;

  lockedAt?: string;

  createdAt: string;

  updatedAt: string;
}
