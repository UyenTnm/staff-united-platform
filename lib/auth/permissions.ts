export function canAdministrativeReview(role: string) {
  return role === "Admin" || role === "HR";
}

export function canManagerReview(role: string) {
  return role === "Manager";
}

export function canRewardKaizen(role: string) {
  return role === "Admin" || role === "HR";
}

export function canViewPerformance(role: string) {
  return role !== "Employee";
}
