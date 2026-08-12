// lib/crm/quote-items.ts

import { supabase } from "../supabase";

export interface QuoteItem {
  id: string;
  quote_id: string;
  service_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  currency_code: string | null;
  is_optional: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
  const { data, error } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data as QuoteItem[];
}

export async function createQuoteItem(data: {
  quote_id: string;
  service_name: string;
  description?: string;
  quantity?: number;
  unit_price: number;
  is_optional?: boolean;
  sort_order?: number;
}) {
  const { error } = await supabase.from("quote_items").insert({
    quote_id: data.quote_id,
    service_name: data.service_name,
    description: data.description || null,
    quantity: data.quantity ?? 1,
    unit_price: data.unit_price,
    is_optional: data.is_optional ?? true,
    sort_order: data.sort_order ?? 0,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function updateQuoteItem(
  id: string,
  data: {
    service_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    is_optional: boolean;
  },
) {
  const { error } = await supabase
    .from("quote_items")
    .update({
      service_name: data.service_name,
      description: data.description || null,
      quantity: data.quantity,
      unit_price: data.unit_price,
      is_optional: data.is_optional,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteQuoteItem(id: string) {
  const { error } = await supabase.from("quote_items").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

// Helper — giá thực tế của 1 hạng mục = số lượng × đơn giá
export function getItemTotal(item: QuoteItem): number {
  return Number(item.quantity) * Number(item.unit_price);
}
