const PAYROLL_CUTOFF_DAY = 25;

export function getReviewMonth(date: Date) {
  const isAfterCutoff = date.getDate() > PAYROLL_CUTOFF_DAY;
  const effectiveDate = isAfterCutoff
    ? new Date(date.getFullYear(), date.getMonth() + 1, 1)
    : date;

  const year = effectiveDate.getFullYear();
  const month = String(effectiveDate.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}
