import { getBehaviorStatistics } from "@/lib/employees/behavior";
import { getQualityStatistics } from "@/lib/employees/quality";
import { getKaizenStatistics } from "../employees/kaizen";
// import { getKaizenStatistics } from "@/lib/employees/kaizen";

export interface ReviewDashboardData {
  behavior: {
    waitingEmployee: number;
    returnedToHR: number;
    resolvedByHR: number;
    waitingManager: number;
    approved: number;
    locked: number;
  };

  quality: {
    waitingEmployee: number;
    returnedToHR: number;
    resolvedByHR: number;
    waitingManager: number;
    approved: number;
    locked: number;
  };

  kaizen: {
    draft: number;
    pending: number;
    underReview: number;
    approved: number;
    rewarded: number;
  };
}

export async function getReviewDashboardData(): Promise<ReviewDashboardData> {
  const [behavior, quality, kaizen] = await Promise.all([
    getBehaviorStatistics(),
    getQualityStatistics(),
    getKaizenStatistics(),
  ]);

  return {
    behavior,
    quality,
    kaizen,
  };
}
