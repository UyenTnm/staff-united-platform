import { supabase } from "@/lib/supabase";

export async function getCRMStats() {
  const [leadsResult, clientsResult, draftQuotesResult, sentQuotesResult] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),

      supabase.from("clients").select("*", { count: "exact", head: true }),

      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("status", "Draft"),

      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("status", "Sent"),
    ]);

  return {
    leads: leadsResult.count ?? 0,
    clients: clientsResult.count ?? 0,
    draftQuotes: draftQuotesResult.count ?? 0,
    sentQuotes: sentQuotesResult.count ?? 0,
  };
}

export async function getPipelineStats() {
  const [newResult, contactedResult, proposalResult, wonResult, lostResult] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "New"),

      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "Contacted"),

      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "Proposal Sent"),

      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "Won"),

      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "Lost"),
    ]);

  return {
    new: newResult.count ?? 0,
    contacted: contactedResult.count ?? 0,
    proposal: proposalResult.count ?? 0,
    won: wonResult.count ?? 0,
    lost: lostResult.count ?? 0,
  };
}
