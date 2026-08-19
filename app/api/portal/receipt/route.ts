import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReceiptPdf } from "@/lib/pdf/generate-receipt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/portal/receipt?quoteId=xxx
// Khách bấm "Download Receipt" trên Portal — kiểm tra đúng session
// (email) khớp đúng quote trước khi cho tải, tránh khách A tải được
// receipt của khách B.
export async function GET(request: NextRequest) {
  try {
    const quoteId = request.nextUrl.searchParams.get("quoteId");
    const authHeader = request.headers.get("authorization");

    if (!quoteId || !authHeader) {
      return NextResponse.json({ error: "Missing params." }, { status: 400 });
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser(accessToken);

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: quote, error } = await supabaseAdmin
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Chỉ cho tải nếu email đăng nhập khớp đúng email trên quote
    const isOwner =
      quote.contact_email === user.email || quote.billing_email === user.email;

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (quote.status !== "Paid") {
      return NextResponse.json(
        { error: "Receipt only available for paid invoices." },
        { status: 400 },
      );
    }

    const isVietnam = quote.customer_market === "vietnam";
    const amount = isVietnam
      ? `${Number(quote.amount).toLocaleString()} VND`
      : `$${Number(quote.amount).toLocaleString()}`;
    const paidDate = quote.paid_at
      ? new Date(quote.paid_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";
    const paymentMethod = isVietnam
      ? "VietQR (Bank Transfer)"
      : "International Wire Transfer (SWIFT)";

    const pdfBytes = await generateReceiptPdf({
      quoteNumber: quote.quote_number,
      companyName: quote.company_name,
      proposalTitle: quote.title,
      amount,
      paidDate,
      paymentMethod,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Receipt-${quote.quote_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate receipt:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt." },
      { status: 500 },
    );
  }
}
