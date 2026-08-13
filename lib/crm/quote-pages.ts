// lib/crm/quote-pages.ts

import { supabase } from "../supabase";

export interface QuotePage {
  id: string;
  quote_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export async function getQuotePages(quoteId: string): Promise<QuotePage[]> {
  const { data, error } = await supabase
    .from("quote_pages")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data as QuotePage[];
}

export async function createQuotePage(data: {
  quote_id: string;
  title: string;
  content: string;
  sort_order?: number;
}) {
  const { error } = await supabase.from("quote_pages").insert({
    quote_id: data.quote_id,
    title: data.title,
    content: data.content,
    sort_order: data.sort_order ?? 0,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteQuotePage(id: string) {
  const { error } = await supabase.from("quote_pages").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
