// lib/crm/quote-pages.ts

import { supabase } from "../supabase";

export type QuotePageType =
  | "custom"
  | "package_detail"
  | "pricing_overview"
  | "partnership_summary"
  | "next_steps";

// ---- Structured data cho từng loại trang ----
// Trang "Package Detail" (khớp ảnh mẫu 3-6: Package Title, Strategic
// Objective, Key Deliverables, Timeline, Price).
export interface PackageDetailData {
  strategic_objective: string;
  deliverables: string[];
  timeline: string;
  price: string;
}

// Trang "Pricing Overview" (khớp ảnh mẫu 2/7: list package + khối
// Strategic Partnership với % off). Mỗi package có mô tả ngắn, giống
// dòng "Description of the package and services included." trong mẫu.
// export interface PricingOverviewData {
//   packages: { title: string; description: string; price: string }[];
//   strategic_partnership_price: string;
//   discount_percent: string;
//   save_amount: string;
// }

export interface PricingOverviewData {
  packages: { title: string; description: string; price: string }[];
  strategic_partnership_price: string;
  discount_percent: string;
  save_amount: string;
  payment_terms: string[];
  image_url: string;
}

// Trang "Next Steps" (khớp ảnh mẫu 8) — danh sách bước tiếp theo,
// hiển thị dạng số thứ tự hoặc bullet tùy sale chọn, + 1 đoạn khép
// lại (closing note).
export interface NextStepsData {
  list_style: "numbered" | "bullet";
  items: string[];
  closing_note: string;
}

export interface QuotePage {
  id: string;
  quote_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  page_type: QuotePageType;
  // Kiểu cụ thể tùy page_type — ép kiểu (as) sang
  // PackageDetailData/PricingOverviewData/NextStepsData ở nơi tiêu thụ.
  structured_data: Record<string, unknown>;
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
  content?: string;
  sort_order?: number;
  page_type?: QuotePageType;
  structured_data?: Record<string, unknown>;
}): Promise<QuotePage> {
  const { data: created, error } = await supabase
    .from("quote_pages")
    .insert({
      quote_id: data.quote_id,
      title: data.title,
      content: data.content ?? "",
      sort_order: data.sort_order ?? 0,
      page_type: data.page_type ?? "custom",
      structured_data: data.structured_data ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("createQuotePage error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  return created as QuotePage;
}

export async function updateQuotePage(
  id: string,
  data: {
    title?: string;
    content?: string;
    structured_data?: Record<string, unknown>;
    sort_order?: number;
  },
) {
  const { error } = await supabase
    .from("quote_pages")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("updateQuotePage error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
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

export async function getQuotePagesByToken(
  token: string,
): Promise<QuotePage[]> {
  try {
    const res = await fetch(`/api/proposal/${token}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.pages as QuotePage[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Upload ảnh riêng cho trang Pricing Overview (khối blob góc phải) —
// KHÁC với ảnh Cover, sale có thể dùng ảnh khác nhau cho từng trang.
// Lưu URL vào structured_data.image_url của chính trang đó, không
// đụng tới bảng quotes.
export async function uploadPricingPageImage(
  quoteId: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${quoteId}/pricing-img-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("proposals")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Upload pricing image error:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposals")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
