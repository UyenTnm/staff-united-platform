"use client";

interface VietQRPaymentProps {
  amount: number;
  addInfo: string;
}

// VietQR chuẩn — không cần API key, chỉ cần đúng thông tin tài khoản.
// Ảnh QR được VietQR.io tự sinh theo URL, hoạt động với mọi app ngân
// hàng Việt Nam hỗ trợ chuẩn VietQR (hầu hết ngân hàng lớn đều có).
//
// Tài khoản VNĐ chính thức của CÔNG TY TNHH STAFF UNITED tại
// Techcombank, chi nhánh Saigon.
const BANK_BIN = "970407"; // Mã BIN của Techcombank
const ACCOUNT_NO = "937718";
const ACCOUNT_NAME = "VND-TGTT-CONG TY TNHH STAFF UNITED";

export function VietQRPayment({ amount, addInfo }: VietQRPaymentProps) {
  const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">
        Scan to pay via bank transfer (Techcombank)
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrUrl}
        alt="VietQR payment code"
        className="h-64 w-64 rounded-lg border"
      />

      <div className="w-full space-y-1 text-sm">
        <div className="flex justify-between border-b pb-1">
          <span className="text-slate-500">Amount</span>
          <span className="font-semibold">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="text-slate-500">Transfer content</span>
          <span className="font-medium">{addInfo}</span>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        After transferring, please allow a few minutes for our team to confirm
        your payment.
      </p>
    </div>
  );
}
