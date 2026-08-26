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
      return NextResponse.json({
        success: false,
        reason: "no_email",
      });
    }

    /*
     * ============================================================
     * QUOTE ITEMS
     * ============================================================
     *
     * Payment email must use the same pricing logic as the public
     * proposal:
     *
     * Original subtotal
     * → Service Discount
     * → Package Discount
     * → Final Amount
     *
     * quote.amount already stores the accepted final amount.
     */

    const { data: quoteItems, error: itemsError } = await supabaseAdmin
      .from("quote_items")
      .select("*")
      .eq("quote_id", quoteId)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      console.error("Failed to load quote items:", itemsError);
      return NextResponse.json(
        { error: "Failed to load quote items." },
        { status: 500 },
      );
    }

    const items = quoteItems || [];

    /*
     * ============================================================
     * PRICING BREAKDOWN
     * ============================================================
     *
     * Important:
     * The public proposal calculates:
     *
     * Service Discount first
     * Package Discount second
     *
     * Package Discount is calculated on the amount after
     * Service Discount.
     */

    const getItemTotal = (item: any) => {
      return Number(item.quantity || 0) * Number(item.unit_price || 0);
    };

    /*
     * We use the accepted final amount stored on the quote.
     *
     * For the normal flow all quote items are included.
     * This gives us the same original subtotal used by the
     * proposal before discounts.
     */
    const originalTotal = items.reduce(
      (sum, item) => sum + getItemTotal(item),
      0,
    );

    /*
     * Service Discount
     */
    const serviceDiscountTotal = items.reduce((sum, item) => {
      if (!item.discount_enabled) return sum;

      const itemTotal = getItemTotal(item);
      const discountPercent = Number(item.discount_percent || 0);

      return sum + (itemTotal * discountPercent) / 100;
    }, 0);

    const afterServiceDiscount = originalTotal - serviceDiscountTotal;

    /*
     * Package Discount
     *
     * Only apply when the full package is selected.
     *
     * The current proposal logic considers the full package selected
     * when all quote items are selected.
     */
    const packageDiscountPercent = quote.package_discount_enabled
      ? Number(quote.package_discount_percent || 0)
      : 0;

    const packageDiscountTotal =
      (afterServiceDiscount * packageDiscountPercent) / 100;

    /*
     * Final amount according to the pricing calculation.
     */
    const calculatedFinalAmount = afterServiceDiscount - packageDiscountTotal;

    /*
     * IMPORTANT:
     *
     * quote.amount is the accepted amount and should remain the
     * source of truth for the actual payment.
     *
     * Therefore we do NOT replace it with a recalculated value.
     */
    const finalAmount = Number(quote.amount);

    /*
     * If there is a mismatch between the calculated amount and
     * quote.amount, keep the actual payment amount from quote.amount.
     *
     * This protects the payment confirmation from accidentally
     * charging/displaying a different amount.
     */
    const pricingDifference = Math.abs(calculatedFinalAmount - finalAmount) > 1;

    if (pricingDifference) {
      console.warn("Payment pricing mismatch:", {
        quoteId,
        calculatedFinalAmount,
        storedFinalAmount: finalAmount,
      });
    }

    const isVietnam = quote.customer_market === "vietnam";
    const currencySymbol = isVietnam ? "₫" : "$";

    /*
     * ============================================================
     * PAYMENT AMOUNT
     * ============================================================
     */

    const depositAmount = Math.round(finalAmount / 2);
    const finalStageAmount = finalAmount - depositAmount;

    const amountNumber =
      stage === "deposit"
        ? depositAmount
        : stage === "final"
          ? finalStageAmount
          : finalAmount;

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

    /*
     * ============================================================
     * RECEIPT PDF
     * ============================================================
     */

    const pdfBytes = await generateReceiptPdf({
      quoteNumber: quote.quote_number,
      companyName: quote.company_name,
      proposalTitle: quote.title,
      amount: pdfAmount,
      paidDate,
      paymentMethod,
    });

    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    /*
     * ============================================================
     * PAYMENT LABEL
     * ============================================================
     */

    const paymentLabel =
      stage === "deposit"
        ? "Deposit Payment Received (50%)"
        : stage === "final"
          ? "Final Payment Received (50%)"
          : "Payment Received";

    /*
     * ============================================================
     * SEND EMAIL
     * ============================================================
     */

    await sendPaymentConfirmedEmail({
      toEmail,
      companyName: quote.company_name,
      proposalTitle: quote.title,

      // Actual amount paid in this stage
      amount,

      quoteNumber: quote.quote_number,
      paidDate,
      paymentMethod,

      hasBillingInfo: Boolean(quote.billing_email),

      pdfBase64,

      paymentLabel,

      // Pricing breakdown
      originalTotal,
      serviceDiscountTotal,
      packageDiscountTotal,
      finalAmount,

      currencySymbol,
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
