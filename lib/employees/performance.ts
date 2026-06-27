import { getBehaviorIssues } from "./behavior";
import { getQualityIssues } from "./quality";

export interface PerformanceSummary {
  quality: number;
  behavior: number;
  kaizen: number;
  total: number;
}

export async function calculateEmployeePerformance(
  employeeId: string,
): Promise<PerformanceSummary> {
  // QUALITY
  const qualityIssues = await getQualityIssues(employeeId);

  const qualityDeduction = qualityIssues.reduce(
    (sum, item) => sum + item.deduction,
    0,
  );

  const quality = Math.max(5 - qualityDeduction, 0);

  // Behavior
  const behaviorIssues = await getBehaviorIssues(employeeId);

  const behaviorDeduction = behaviorIssues.reduce(
    (sum, issue) => sum + issue.deduction,
    0,
  );

  const behavior = Math.max(5 - behaviorDeduction, 0);

  // Chưa làm Kaizen
  const kaizen = 0;

  console.log("Quality Issues:", qualityIssues);
  console.log("Quality Deduction:", qualityDeduction);

  console.log("Behavior Issues:", behaviorIssues);
  console.log("Behavior Deduction:", behaviorDeduction);

  return {
    quality,
    behavior,
    kaizen,
    total: quality + behavior + kaizen,
  };
}
