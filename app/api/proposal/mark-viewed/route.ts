import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("quotes")
      .select("id, proposal_status")
      .eq("public_token", token)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    if (existing.proposal_status === "draft" || existing.proposal_status === "sent") {
      const { error: updateError } = await supabaseAdmin
        .from("quotes")
        .update({ proposal_status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) {
        console.error(updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
