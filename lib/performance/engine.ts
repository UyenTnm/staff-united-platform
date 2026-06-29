import { getQualityIssues } from "@/lib/employees/quality";
import { getBehaviorIssues } from "@/lib/employees/behavior";

export interface ReviewScores {
  quality: number;
  behavior: number;
  kaizen: number;
  total: number;
}

export async function calculateReviewScores(
  employeeId: string,
): Promise<ReviewScores> {
  const qualityIssues = await getQualityIssues(employeeId);

  const behaviorIssues = await getBehaviorIssues(employeeId);

  const qualityDeduction = qualityIssues.reduce(
    (sum, issue) => sum + issue.deduction,
    0,
  );

  const behaviorDeduction = behaviorIssues.reduce(
    (sum, issue) => sum + issue.deduction,
    0,
  );

  const quality = Math.max(5 - qualityDeduction, 0);

  const behavior = Math.max(5 - behaviorDeduction, 0);

  const kaizen = 0;

  return {
    quality,

    behavior,

    kaizen,

    total: quality + behavior + kaizen,
  };
}
