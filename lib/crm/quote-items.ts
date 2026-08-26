// lib/crm/quote-items.ts

import { supabase } from "../supabase";
import {
  generateMilestonesForService,
  removeMilestonesForService,
} from "./milestones";

export interface QuoteItem {
  id: string;
  quote_id: string;
  service_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  currency_code: string | null;
  is_optional: boolean;
  discount_enabled: boolean;
  discount_percent: number;
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
  // MỚI — truyền đúng đơn vị tiền tệ (VND/USD) khi tạo item, phòng
  // trường hợp cột currency_code trong DB yêu cầu bắt buộc (NOT NULL).
  currency_code?: string;
  discount_enabled?: boolean;
  discount_percent?: number;
}) {
  const { error } = await supabase.from("quote_items").insert({
    quote_id: data.quote_id,
    service_name: data.service_name,
    description: data.description || null,
    quantity: data.quantity ?? 1,
    unit_price: data.unit_price,
    is_optional: data.is_optional ?? true,
    sort_order: data.sort_order ?? 0,
    currency_code: data.currency_code ?? "VND",

    discount_enabled: data.discount_enabled ?? false,
    discount_percent: data.discount_percent ?? 0,
  });

  if (error) {
    // ĐÃ SỬA — log rõ message/code/details/hint thay vì {} mơ hồ.
    console.error("createQuoteItem error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  // Thêm Service xong → TỰ ĐỘNG sinh sẵn bộ Milestone chuẩn theo
  // đúng dịch vụ chi tiết khách đã chọn (phân tích từ description).
  await generateMilestonesForService(
    data.quote_id,
    data.service_name,
    data.description,
  );
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
    console.error("updateQuoteItem error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
}

export async function deleteQuoteItem(id: string) {
  // Lấy trước quote_id + service_name để biết cần dọn milestone nào
  const { data: itemToDelete } = await supabase
    .from("quote_items")
    .select("quote_id, service_name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("quote_items").delete().eq("id", id);

  if (error) {
    console.error("deleteQuoteItem error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  // Chỉ dọn milestone nếu KHÔNG CÒN Service nào khác cùng tên trong
  // Quote này (tránh xóa nhầm milestone đang dùng chung).
  if (itemToDelete) {
    const { data: remaining } = await supabase
      .from("quote_items")
      .select("id")
      .eq("quote_id", itemToDelete.quote_id)
      .eq("service_name", itemToDelete.service_name)
      .limit(1);

    if (!remaining || remaining.length === 0) {
      await removeMilestonesForService(
        itemToDelete.quote_id,
        itemToDelete.service_name,
      );
    }
  }
}

export function getItemTotal(item: QuoteItem): number {
  return Number(item.quantity) * Number(item.unit_price);
}

export function getItemDiscountAmount(item: QuoteItem): number {
  if (!item.discount_enabled) return 0;

  const subtotal = getItemTotal(item);

  const percent = Math.min(
    Math.max(Number(item.discount_percent) || 0, 0),
    100,
  );

  return subtotal * (percent / 100);
}

export function getItemFinalTotal(item: QuoteItem): number {
  return getItemTotal(item) - getItemDiscountAmount(item);
}

export async function getQuoteItemsByToken(
  token: string,
): Promise<QuoteItem[]> {
  try {
    const res = await fetch(`/api/proposal/${token}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.items as QuoteItem[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateQuoteItemDiscount(
  id: string,
  data: {
    discount_enabled: boolean;
    discount_percent: number;
  },
) {
  const percent = Math.min(
    Math.max(Number(data.discount_percent) || 0, 0),
    100,
  );

  const { error } = await supabase
    .from("quote_items")
    .update({
      discount_enabled: data.discount_enabled,
      discount_percent: percent,
    })
    .eq("id", id);

  if (error) {
    console.error("updateQuoteItemDiscount error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw error;
  }
}
