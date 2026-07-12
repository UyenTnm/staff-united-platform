export interface PerformanceScores {
  quality: number;
  behavior: number;
  kaizen: number;
}

export const MAX_QUALITY_SCORE = 5;
export const MAX_BEHAVIOR_SCORE = 5;
export const MAX_KAIZEN_SCORE = 5;

export const MAX_MONTHLY_BONUS =
  MAX_QUALITY_SCORE + MAX_BEHAVIOR_SCORE + MAX_KAIZEN_SCORE;

export function calculateMonthlyBonus(scores: PerformanceScores) {
  return scores.quality + scores.behavior + scores.kaizen;
}
