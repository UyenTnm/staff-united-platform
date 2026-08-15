import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/crm/quotes";
import { sendPaymentConfirmedEmail } from "@/lib/email/email-service";
import { generateReceiptPdf } from "@/lib/pdf/generate-receipt";

export async function POST(request: NextRequest) {
  try {
    const { quoteId } = await request.json();

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
    const amount = `${currencySymbol}${Number(quote.amount).toLocaleString()}`;
    // PDF dùng font chuẩn (WinAnsi) không hỗ trợ ký hiệu ₫ — dùng chữ
    // "VND" thay thế riêng cho bản PDF, email HTML vẫn giữ ₫ bình thường.
    const pdfAmount = isVietnam
      ? `${Number(quote.amount).toLocaleString()} VND`
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
