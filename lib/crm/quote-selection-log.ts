// lib/crm/quote-selection-log.ts

import { supabase } from "../supabase";

export interface SelectionLogEntry {
  id: string;
  quote_id: string;
  selected_items: string;
  total_amount: number;
  changed_at: string;
}

export async function logSelectionChange(data: {
  quote_id: string;
  selected_items: string;
  total_amount: number;
}) {
  const { error } = await supabase.from("quote_selection_log").insert(data);
  if (error) {
    // Không throw — ghi log là phụ, không nên chặn luồng chính nếu lỗi
    console.error("logSelectionChange error:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }
}

export async function getSelectionLog(
  quoteId: string,
): Promise<SelectionLogEntry[]> {
  const { data, error } = await supabase
    .from("quote_selection_log")
    .select("*")
    .eq("quote_id", quoteId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as SelectionLogEntry[];
}
