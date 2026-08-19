import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { token, acceptedByName, clientNotes, finalAmount } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    // Xác thực đúng luồng: chỉ cho accept nếu đang ở sent/viewed
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("quotes")
      .select("id, proposal_status")
      .eq("public_token", token)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    if (!["sent", "viewed"].includes(existing.proposal_status)) {
      return NextResponse.json(
        { error: "Proposal is not in an acceptable state." },
        { status: 400 },
      );
    }

    const updatePayload: Record<string, unknown> = {
      proposal_status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by_name: acceptedByName,
      client_notes: clientNotes || null,
    };
    if (typeof finalAmount === "number") {
      updatePayload.amount = finalAmount;
    }

    const { error: updateError } = await supabaseAdmin
      .from("quotes")
      .update(updatePayload)
      .eq("id", existing.id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
