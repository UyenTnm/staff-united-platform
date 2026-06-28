import { getBehaviorIssues } from "./behavior";
import { getEmployeeKaizens } from "./kaizen";
import { getQualityIssues } from "./quality";

export interface PerformanceSummary {
  quality: number;
  behavior: number;
  kaizen: number;
  total: number;
  qualityIssues: number;
  behaviorIssues: number;
  kaizenRecords: number;
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

  // Kaizen
  // Kaizen
  const kaizens = await getEmployeeKaizens(employeeId);

  const kaizenPoints = kaizens.reduce(
    (sum, item) => sum + (item.performance_points ?? 0),
    0,
  );

  // Giới hạn tối đa 5 điểm
  const kaizen = Math.min(kaizenPoints, 5);

  return {
    quality,
    behavior,
    kaizen,
    total: quality + behavior + kaizen,

    qualityIssues: qualityIssues.length,
    behaviorIssues: behaviorIssues.length,
    kaizenRecords: kaizens.length,
  };
}
