export interface PerformanceScores {
  quality: number;
  behavior: number;
  kaizen: number;
}

export function calculateTotalScore(scores: PerformanceScores) {
  return scores.quality + scores.behavior + scores.kaizen;
}

export function calculatePercentage(totalScore: number) {
  return Number(((totalScore / 15) * 100).toFixed(1));
}
