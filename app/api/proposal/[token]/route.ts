// app/api/proposal/[token]/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const { data: quote, error } = await supabaseAdmin
    .from("quotes")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [{ data: items }, { data: pages }] = await Promise.all([
    supabaseAdmin
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("quote_pages")
      .select("*")
      .eq("quote_id", quote.id)
      .order("sort_order", { ascending: true }),
  ]);

  return NextResponse.json({
    quote,
    items: items ?? [],
    pages: pages ?? [],
  });
}
