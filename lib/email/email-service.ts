import { resend } from "./resend";
import { welcomeEmailTemplate } from "../templates/welcome-email";
import { proposalLinkEmailTemplate } from "../templates/proposal-link-email";
import { paymentConfirmedEmailTemplate } from "../templates/payment-confirmed-email";

interface WelcomeEmailInput {
  fullName: string;
  email: string;
  temporaryPassword: string;
}

export async function sendWelcomeEmail({
  fullName,
  email,
  temporaryPassword,
}: WelcomeEmailInput) {
  console.log("========== RESEND TEST ==========");
  console.log("API KEY:", process.env.RESEND_API_KEY);
  console.log("Sending email to:", email);

  const result = await resend.emails.send({
    from: "STAFF United <no-reply@staffunitedgroup.com>",
    to: email,
    subject: "Welcome to STAFF United",
    html: welcomeEmailTemplate({
      fullName,
      email,
      temporaryPassword,
    }),
  });

  console.log("Resend Result:");
  console.log(result);

  return result;
}

// ============================================================
// MỚI — gửi lại link proposal cho khách hàng (khách tự nhập email
// trên trang public, phòng khi làm mất link/xoá email cũ).
// ============================================================
interface ProposalLinkEmailInput {
  toEmail: string;
  companyName: string;
  proposalTitle: string;
  proposalUrl: string;
}

export async function sendProposalLinkEmail({
  toEmail,
  companyName,
  proposalTitle,
  proposalUrl,
}: ProposalLinkEmailInput) {
  const result = await resend.emails.send({
    from: "STAFF United <no-reply@staffunitedgroup.com>",
    to: toEmail,
    subject: `Your proposal: ${proposalTitle}`,
    html: proposalLinkEmailTemplate({
      companyName,
      proposalTitle,
      proposalUrl,
    }),
  });

  return result;
}

// ============================================================
// MỚI — gửi email xác nhận đã nhận thanh toán, kèm báo trước về
// hóa đơn nếu khách đã điền billing info.
// ============================================================
interface PaymentConfirmedEmailInput {
  toEmail: string;
  companyName: string;
  proposalTitle: string;
  amount: string;
  quoteNumber: string;
  paidDate: string;
  paymentMethod: string;
  hasBillingInfo: boolean;
  // PDF biên lai đính kèm — base64, KHÔNG kèm tiền tố "data:...;base64,"
  pdfBase64?: string;
  // Nhãn hiển thị theo giai đoạn — VD: "Deposit Payment Received (50%)"
  paymentLabel?: string;
}

export async function sendPaymentConfirmedEmail({
  toEmail,
  companyName,
  proposalTitle,
  amount,
  quoteNumber,
  paidDate,
  paymentMethod,
  hasBillingInfo,
  pdfBase64,
  paymentLabel,
}: PaymentConfirmedEmailInput) {
  const result = await resend.emails.send({
    from: "STAFF United <no-reply@staffunitedgroup.com>",
    to: toEmail,
    subject: `${paymentLabel || "Payment received"} — ${quoteNumber}`,
    html: paymentConfirmedEmailTemplate({
      companyName,
      proposalTitle,
      amount,
      quoteNumber,
      paidDate,
      paymentMethod,
      hasBillingInfo,
      paymentLabel,
    }),
    attachments: pdfBase64
      ? [
          {
            filename: `Receipt-${quoteNumber}.pdf`,
            content: pdfBase64,
          },
        ]
      : undefined,
  });

  return result;
}
