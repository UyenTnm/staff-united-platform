import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPaymentConfirmedEmail } from "@/lib/email/email-service";
import { generateReceiptPdf } from "@/lib/pdf/generate-receipt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { quoteId, stage } = await request.json();

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quoteId." }, { status: 400 });
    }

    const { data: quote, error: quoteError } = await supabaseAdmin
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
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
