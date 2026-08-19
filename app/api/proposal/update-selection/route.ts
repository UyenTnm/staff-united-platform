import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { quoteId, selectedTitles, finalAmount } = await request.json();
    if (!quoteId || typeof finalAmount !== "number") {
      return NextResponse.json({ error: "Missing params." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("quotes")
      .update({
        amount: finalAmount,
        client_notes: selectedTitles ? `Selected: ${selectedTitles}` : null,
        selection_unlocked: false,
      })
      .eq("id", quoteId);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
