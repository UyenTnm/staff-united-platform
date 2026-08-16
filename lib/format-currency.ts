export function formatCurrency(amount: number, isVietnam: boolean): string {
  if (isVietnam) {
    return `₫${Math.round(amount).toLocaleString("en-US")}`;
  }

  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Dùng khi PDF (pdf-lib font chuẩn không hỗ trợ ký hiệu ₫) — trả về
// dạng chữ, VD: "10,000,000 VND" hoặc "$10,000.00"
export function formatCurrencyForPdf(
  amount: number,
  isVietnam: boolean,
): string {
  if (isVietnam) {
    return `${Math.round(amount).toLocaleString("en-US")} VND`;
  }

  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
