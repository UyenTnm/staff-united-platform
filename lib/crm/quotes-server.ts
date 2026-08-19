// lib/crm/quotes-server.ts
import { createClient } from "../supabase/server";

export async function getQuotesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
