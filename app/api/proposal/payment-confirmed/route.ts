import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/crm/quotes";
import { sendPaymentConfirmedEmail } from "@/lib/email/email-service";
import { generateReceiptPdf } from "@/lib/pdf/generate-receipt";

export async function POST(request: NextRequest) {
  try {
    const { quoteId, stage } = await request.json();
    // stage: "deposit" | "final" | "full" — quyết định đúng số tiền
    // và nội dung email hiển thị cho khách (KHÔNG được luôn gửi full
    // amount nếu chỉ mới nhận deposit).

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quoteId." }, { status: 400 });
    }

    const quote = await getQuote(quoteId);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    const toEmail = quote.billing_email || quote.contact_email;

    if (!toEmail) {
      return NextResponse.json({ success: false, reason: "no_email" });
    }

    const isVietnam = quote.customer_market === "vietnam";
    const currencySymbol = isVietnam ? "₫" : "$";

    const fullAmount = Number(quote.amount);
    const depositAmount = Math.round(fullAmount / 2);
    const finalStageAmount = fullAmount - depositAmount;

    const amountNumber =
      stage === "deposit"
        ? depositAmount
        : stage === "final"
          ? finalStageAmount
          : fullAmount;

    const amount = `${currencySymbol}${amountNumber.toLocaleString()}`;
    const pdfAmount = isVietnam
      ? `${amountNumber.toLocaleString()} VND`
      : amount;
    const paidDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const paymentMethod = isVietnam
      ? "VietQR (Bank Transfer)"
      : "International Wire Transfer (SWIFT)";

    const pdfBytes = await generateReceiptPdf({
      quoteNumber: quote.quote_number,
      companyName: quote.company_name,
      proposalTitle: quote.title,
      amount: pdfAmount,
      paidDate,
      paymentMethod,
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    // Nhãn rõ ràng theo đúng giai đoạn — tránh email luôn ghi
    // "Payment Received" chung chung dù chỉ mới nhận 1 nửa.
    const paymentLabel =
      stage === "deposit"
        ? "Deposit Payment Received (50%)"
        : stage === "final"
          ? "Final Payment Received (50%)"
          : "Payment Received";

    await sendPaymentConfirmedEmail({
      toEmail,
      companyName: quote.company_name,
      proposalTitle: quote.title,
      amount,
      quoteNumber: quote.quote_number,
      paidDate,
      paymentMethod,
      hasBillingInfo: Boolean(quote.billing_email),
      pdfBase64,
      paymentLabel,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 },
    );
  }
}
