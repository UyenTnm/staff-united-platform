import {
  getQualityIssues,
  calculateQualityScore,
} from "@/lib/employees/quality";

import {
  getBehaviorIssues,
  calculateBehaviorScore,
} from "@/lib/employees/behavior";

import { getEmployeeKaizens } from "@/lib/employees/kaizen";

import { calculateMonthlyBonus } from "./calculator";

export interface ReviewScores {
  quality: number;
  behavior: number;
  kaizen: number;

  total: number;

  qualityIssues: number;
  behaviorIssues: number;
  rewardedKaizens: number;
}

export async function calculateReviewScores(
  employeeId: string,
): Promise<ReviewScores> {
  /**
   * QUALITY
   */
  const qualityIssues = await getQualityIssues(employeeId);

  const qualityScore = calculateQualityScore(qualityIssues);

  /**
   * BEHAVIOR
   */
  const behaviorIssues = await getBehaviorIssues(employeeId);

  const behaviorScore = calculateBehaviorScore(behaviorIssues);

  /**
   * KAIZEN
   */
  const kaizens = await getEmployeeKaizens(employeeId);

  const rewardedKaizens = kaizens.filter((item) => item.status === "Rewarded");

  const kaizenPoints = rewardedKaizens.reduce(
    (sum, item) => sum + (item.performance_points ?? 0),
    0,
  );

  // Kaizen bonus tối đa 5%
  const kaizen = Math.min(kaizenPoints, 5);

  /**
   * MONTHLY BONUS
   */
  const total = calculateMonthlyBonus({
    quality: qualityScore.currentScore,
    behavior: behaviorScore.currentScore,
    kaizen,
  });

  return {
    quality: qualityScore.currentScore,

    behavior: behaviorScore.currentScore,

    kaizen,

    total,

    qualityIssues: qualityIssues.length,

    behaviorIssues: behaviorIssues.length,

    rewardedKaizens: rewardedKaizens.length,
  };
}
