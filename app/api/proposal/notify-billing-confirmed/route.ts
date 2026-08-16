import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/proposal/notify-billing-confirmed
// Body: { quoteId: string }
//
// Khách (anon, chưa đăng nhập) không thể tự ghi vào bảng
// notifications (bảng nội bộ, dùng chung với Academy) — nên phải đi
// qua route server-side này, dùng Service Role Key.
export async function POST(request: NextRequest) {
  try {
    const { quoteId } = await request.json();

    if (!quoteId) {
      return NextResponse.json({ error: "Missing quoteId." }, { status: 400 });
    }

    const { data: quote, error: fetchError } = await supabaseAdmin
      .from("quotes")
      .select("id, quote_number, company_name, created_by")
      .eq("id", quoteId)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    // Quote cũ (tạo trước khi có cột created_by) sẽ không có ai để
    // gửi — bỏ qua, không coi là lỗi.
    if (!quote.created_by) {
      return NextResponse.json({ success: false, reason: "no_owner" });
    }

    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert({
        employee_id: quote.created_by,
        title: "Client confirmed billing info",
        message: `${quote.company_name} confirmed billing info for ${quote.quote_number}. Check if payment has been received.`,
        type: "quote",
        action_url: `/crm/quotes/${quote.id}?tab=payment`,
      });

    if (insertError) {
      console.error("Failed to create notification:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("notify-billing-confirmed error:", error);
    return NextResponse.json(
      { error: "Failed to send notification." },
      { status: 500 },
    );
  }
}
