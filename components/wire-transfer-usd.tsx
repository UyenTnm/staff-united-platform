"use client";

interface WireTransferUSDProps {
  amount: number;
  addInfo: string;
}

// Thông tin chuyển khoản quốc tế (USD) — tài khoản USD thật của
// CÔNG TY TNHH STAFF UNITED tại Techcombank, chi nhánh Saigon.
const BANK_NAME =
  "Vietnam Technological and Commercial Joint Stock Bank (Techcombank)";
const ACCOUNT_NO_USD = "817739";
const ACCOUNT_NAME_USD = "USD-TGTT-CONG TY TNHH STAFF UNITED";
const SWIFT_CODE = "VTCBVNVX";
const BRANCH_NAME = "Saigon Branch";
const BANK_ADDRESS =
  "23 Le Duan, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam";

export function WireTransferUSD({ amount, addInfo }: WireTransferUSDProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Bank Name", value: BANK_NAME },
    { label: "Branch", value: BRANCH_NAME },
    { label: "Account Number", value: ACCOUNT_NO_USD },
    { label: "Account Name", value: ACCOUNT_NAME_USD },
    { label: "SWIFT / BIC Code", value: SWIFT_CODE },
    { label: "Bank Address", value: BANK_ADDRESS },
    { label: "Amount", value: `$${amount.toLocaleString()} USD` },
    { label: "Reference / Memo", value: addInfo },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="mb-4 text-sm text-slate-500">
        Please transfer via international bank wire (SWIFT) using the details
        below.
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-b-0"
          >
            <span className="flex-shrink-0 text-slate-500">{row.label}</span>
            <span className="text-right font-medium text-slate-900">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Please note: all bank transfer/intermediary charges are to be borne by
        the sender unless otherwise agreed. After transferring, please allow a
        few business days for our team to confirm receipt (SWIFT transfers can
        take 1–3 business days).
      </p>
    </div>
  );
}
