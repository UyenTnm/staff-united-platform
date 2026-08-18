import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/portal/request-services
// Body: { accessToken, selectedServices: string[], notes: string }
//
// Khách bấm "Submit Request" trên Portal — tạo 1 Lead mới cho Sale
// theo dõi, kèm thông báo gửi đúng người từng phụ trách khách này
// (dựa theo Quote gần nhất của họ).
export async function POST(request: NextRequest) {
  try {
    const { accessToken, selectedServices, notes } = await request.json();

    if (!accessToken || !selectedServices?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Xác thực đúng khách đang đăng nhập (không cho giả mạo email)
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Lấy thông tin công ty + người phụ trách từ Quote gần nhất của
    // khách này — để tạo Lead đúng công ty và biết gửi thông báo cho ai.
    const { data: latestQuote } = await supabaseAdmin
      .from("quotes")
      .select("company_name, contact_name, contact_phone, created_by")
      .or(`contact_email.eq.${user.email},billing_email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const companyName = latestQuote?.company_name || user.email;
    const contactName = latestQuote?.contact_name || user.email;

    const { data: newLead, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert({
        lead_number: `L-${Date.now()}`,
        company_name: companyName,
        contact_name: contactName,
        phone: latestQuote?.contact_phone || null,
        email: user.email,
        department: selectedServices.join(", "),
        source: "Client Portal Request",
        status: "New",
        priority: "Medium",
      })
      .select()
      .single();

    if (leadError) {
      console.error("Failed to create lead:", leadError);
      return NextResponse.json({ error: leadError.message }, { status: 500 });
    }

    // Gửi thông báo cho đúng nhân viên đã phụ trách khách này trước
    // đó (nếu có) — dùng đúng hệ thống Notification có sẵn. Nội dung
    // đầy đủ (dịch vụ + ghi chú khách) nằm trong message vì bảng
    // leads không có cột notes riêng.
    if (latestQuote?.created_by) {
      await supabaseAdmin.from("notifications").insert({
        employee_id: latestQuote.created_by,
        title: "New service request from client",
        message: `${companyName} requested: ${selectedServices.join(", ")}. ${
          notes ? `Note: ${notes}` : ""
        }`,
        type: "system",
        app: "platform",
        action_url: `/crm/leads/${newLead.id}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("request-services error:", error);
    return NextResponse.json(
      { error: "Failed to submit request." },
      { status: 500 },
    );
  }
}
