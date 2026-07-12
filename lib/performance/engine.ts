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

  qualitySummary: {
    waitingEmployee: number;
    returnedToHR: number;
    waitingManager: number;
    approved: number;
    locked: number;
  };

  behaviorSummary: {
    waitingEmployee: number;
    returnedToHR: number;
    waitingManager: number;
    approved: number;
    locked: number;
  };

  kaizenSummary: {
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    implemented: number;
    rewarded: number;
  };
}

export async function calculateReviewScores(
  employeeId: string,
  reviewMonth?: string,
): Promise<ReviewScores> {
  /**
   * QUALITY
   */
  const qualityIssues = await getQualityIssues(employeeId, reviewMonth);
  const qualitySummary = {
    waitingEmployee: qualityIssues.filter(
      (i) => i.status === "Waiting Employee",
    ).length,

    returnedToHR: qualityIssues.filter((i) => i.status === "Returned to HR")
      .length,

    waitingManager: qualityIssues.filter((i) => i.status === "Waiting Manager")
      .length,

    approved: qualityIssues.filter((i) => i.status === "Approved").length,

    locked: qualityIssues.filter((i) => i.status === "Locked").length,
  };

  const qualityScore = calculateQualityScore(qualityIssues);

  /**
   * BEHAVIOR
   */
  const behaviorIssues = await getBehaviorIssues(employeeId, reviewMonth);
  const behaviorSummary = {
    waitingEmployee: behaviorIssues.filter(
      (i) => i.status === "Waiting Employee",
    ).length,

    returnedToHR: behaviorIssues.filter((i) => i.status === "Returned to HR")
      .length,

    waitingManager: behaviorIssues.filter((i) => i.status === "Waiting Manager")
      .length,

    approved: behaviorIssues.filter((i) => i.status === "Approved").length,

    locked: behaviorIssues.filter((i) => i.status === "Locked").length,
  };

  const behaviorScore = calculateBehaviorScore(behaviorIssues);

  /**
   * KAIZEN
   */
  const kaizens = await getEmployeeKaizens(employeeId, reviewMonth);
  console.log("Kaizens from DB", kaizens);
  // const rewardedKaizens = kaizens.filter((item) => item.status === "Rewarded");

  // console.table(
  //   kaizens.map((k) => ({
  //     title: k.title,
  //     status: JSON.stringify(k.status),
  //     points: k.performance_points,
  //   })),
  // );

  const rewardedKaizens = kaizens.filter((k) => {
    console.log(
      "Compare:",
      JSON.stringify(k.status),
      JSON.stringify("Rewarded"),
      k.status === "Rewarded",
    );

    return k.status === "Rewarded";
  });

  // console.log("Review Month:", reviewMonth);
  // console.log("Employee:", employeeId);
  // console.log("Kaizens:", kaizens);
  // console.log("Rewarded:", rewardedKaizens);

  // console.table(
  //   kaizens.map((k) => ({
  //     title: k.title,
  //     status: k.status,
  //     points: k.performance_points,
  //     month: k.review_month,
  //   })),
  // );

  const kaizenSummary = {
    draft: kaizens.filter((k) => k.status === "Draft").length,

    submitted: kaizens.filter((k) => k.status === "Submitted").length,

    underReview: kaizens.filter((k) => k.status === "Under Review").length,

    approved: kaizens.filter((k) => k.status === "Approved").length,

    implemented: kaizens.filter((k) => k.status === "Implemented").length,

    rewarded: rewardedKaizens.length,
  };

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

    qualitySummary,

    behaviorSummary,

    kaizenSummary,
  };
}
