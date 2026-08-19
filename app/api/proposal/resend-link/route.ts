import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProposalUrl } from "@/lib/crm/quotes";
import { sendProposalLinkEmail } from "@/lib/email/email-service";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/proposal/resend-link
// Body: { token: string, email: string }
// Dùng cho trang public proposal — khách tự nhập email, gọi route này
// để nhận lại link proposal, không cần đăng nhập.
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Missing token or email." },
        { status: 400 },
      );
    }

    const { data: quote, error } = await supabaseAdmin
      .from("quotes")
      .select("*")
      .eq("public_token", token)
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { error: "Proposal not found." },
        { status: 404 },
      );
    }

    const proposalUrl = getProposalUrl(quote.public_token);

    await sendProposalLinkEmail({
      toEmail: email,
      companyName: quote.company_name,
      proposalTitle: quote.title,
      proposalUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resend proposal link:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 },
    );
  }
}
