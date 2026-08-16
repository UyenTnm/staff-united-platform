import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST /api/portal/invite
// Body: { email: string }
// Sale bấm "Invite to Client Portal" — gửi email chứa link để khách
// TỰ ĐẶT MẬT KHẨU lần đầu (không phải Magic Link đăng nhập thẳng).
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // inviteUserByEmail gửi email chứa link xác thực — link này sẽ
    // đưa khách tới trang /portal/set-password để tự đặt mật khẩu.
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${baseUrl}/portal/set-password` },
    );

    if (error) {
      if (error.message.includes("already been registered")) {
        return NextResponse.json({ success: true, alreadyInvited: true });
      }
      console.error("Invite error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.user) {
      await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        role: "client",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to invite client:", error);
    return NextResponse.json(
      { error: "Failed to send invite." },
      { status: 500 },
    );
  }
}
