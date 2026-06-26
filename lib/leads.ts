import { supabase } from "@/lib/supabase";

export async function getLeads() {
  // Lấy tất cả Leads
  const { data: leads, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (leadError) {
    console.error(leadError);
    return [];
  }

  // Lấy tất cả Quotes
  const { data: quotes, error: quoteError } = await supabase
    .from("quotes")
    .select("id, lead_id");

  if (quoteError) {
    console.error(quoteError);
  }

  // Gắn Quote vào từng Lead
  return leads.map((lead) => {
    const quote = quotes?.find((q) => q.lead_id === lead.id);

    return {
      ...lead,
      hasQuote: !!quote,
      quoteId: quote?.id ?? null,
    };
  });
}
