// lib/number-to-words.ts
//
// Đọc số tiền thành chữ — hiện ngay dưới ô nhập giá để nhân viên TỰ
// NHẬN RA lỗi nhập thiếu/thừa số 0 (VD: gõ nhầm 5,000 thay vì
// 5,000,000 — nhìn số dễ nhầm, nhưng đọc chữ "Năm nghìn đồng" vs
// "Năm triệu đồng" thì không thể nhầm).

const VN_DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readGroupVN(num: number): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const units = num % 10;
  let result = "";

  if (hundreds > 0) {
    result += `${VN_DIGITS[hundreds]} trăm `;
  }

  if (tens === 0 && units > 0 && hundreds > 0) {
    result += `linh ${VN_DIGITS[units]}`;
  } else if (tens === 1) {
    result += `mười${units > 0 ? ` ${units === 5 ? "lăm" : VN_DIGITS[units]}` : ""}`;
  } else if (tens > 1) {
    result += `${VN_DIGITS[tens]} mươi${units > 0 ? ` ${units === 1 ? "mốt" : units === 5 ? "lăm" : VN_DIGITS[units]}` : ""}`;
  } else if (units > 0 && hundreds === 0) {
    result += VN_DIGITS[units];
  }

  return result.trim();
}

// Đọc số tiền VNĐ thành chữ, VD: 5000000 → "Năm triệu đồng"
export function numberToWordsVN(amount: number): string {
  if (amount === 0) return "Không đồng";
  if (amount < 0) return "Số âm";

  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let n = Math.round(amount);

  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      parts.push(`${readGroupVN(groups[i])} ${units[i]}`.trim());
    }
  }

  const result = parts.join(" ") + " đồng";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Đọc số tiền USD thành chữ, VD: 5000 → "Five thousand dollars"
const EN_ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const EN_TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function readGroupEN(num: number): string {
  let result = "";
  const hundreds = Math.floor(num / 100);
  const rest = num % 100;

  if (hundreds > 0) {
    result += `${EN_ONES[hundreds]} hundred `;
  }

  if (rest < 20) {
    if (rest > 0) result += EN_ONES[rest];
  } else {
    result += EN_TENS[Math.floor(rest / 10)];
    if (rest % 10 > 0) result += `-${EN_ONES[rest % 10]}`;
  }

  return result.trim();
}

export function numberToWordsEN(amount: number): string {
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  if (dollars === 0 && cents === 0) return "Zero dollars";

  const units = ["", "thousand", "million", "billion"];
  const groups: number[] = [];
  let n = dollars;

  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      parts.push(`${readGroupEN(groups[i])} ${units[i]}`.trim());
    }
  }

  let result = parts.length > 0 ? parts.join(" ") : "zero";
  result += dollars === 1 ? " dollar" : " dollars";

  if (cents > 0) {
    result += ` and ${readGroupEN(cents)} cent${cents === 1 ? "" : "s"}`;
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Đọc số tiền VNĐ bằng CHỮ TIẾNG ANH (không phải tiếng Việt) — VD:
// 5000000 → "Five million VND". Dùng chung cấu trúc đọc số với USD
// (EN_ONES/EN_TENS) nhưng không có phần cent (VNĐ không có số lẻ).
export function numberToWordsVNInEnglish(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return "Zero VND";

  const units = ["", "thousand", "million", "billion"];
  const groups: number[] = [];
  let rest = n;

  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      parts.push(`${readGroupEN(groups[i])} ${units[i]}`.trim());
    }
  }

  const result = (parts.length > 0 ? parts.join(" ") : "zero") + " VND";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Hàm chung — tự chọn đúng ngôn ngữ theo thị trường. LƯU Ý: cả VNĐ
// và USD đều đọc bằng CHỮ TIẾNG ANH (không dùng tiếng Việt nữa).
export function amountToWords(amount: number, isVietnam: boolean): string {
  if (!amount || amount <= 0) return "";
  return isVietnam ? numberToWordsVNInEnglish(amount) : numberToWordsEN(amount);
}
