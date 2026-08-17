// lib/crm/milestones.ts
//
// Milestone sinh TỰ ĐỘNG theo đúng dịch vụ chi tiết khách đã chọn
// (phân tích từ description của Quote Item) — 3 tầng:
// Department (service_name) > Category > Service chi tiết (title).
// Sale chỉ tích ✓, không sửa tên. Tự động "vá" milestone còn thiếu
// cho Quote cũ mỗi khi mở tab Progress (không cần script riêng).

import { supabase } from "../supabase";
import {
  getMilestoneTemplate,
  parseServiceDescription,
} from "../milestone-templates";

export interface Milestone {
  id: string;
  quote_id: string;
  service_name: string;
  category: string | null;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export async function getMilestones(quoteId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data as Milestone[];
}

// Sinh milestone cho 1 Service — ưu tiên phân tích description (lấy
// ĐÚNG Category + dịch vụ chi tiết khách chọn thật); nếu không phân
// tích được (VD: Service tự gõ tay, không theo Catalog) thì dùng bộ
// bước chung mặc định.
export async function generateMilestonesForService(
  quoteId: string,
  serviceName: string,
  description?: string | null,
) {
  const { data: existing } = await supabase
    .from("project_milestones")
    .select("id")
    .eq("quote_id", quoteId)
    .eq("service_name", serviceName)
    .limit(1);

  if (existing && existing.length > 0) return;

  const { data: currentMax } = await supabase
    .from("project_milestones")
    .select("sort_order")
    .eq("quote_id", quoteId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (currentMax?.sort_order ?? -1) + 1;

  const parsedGroups = description ? parseServiceDescription(description) : [];

  const rows: {
    quote_id: string;
    service_name: string;
    category: string | null;
    title: string;
    sort_order: number;
  }[] = [];

  if (parsedGroups.length > 0) {
    // Có Category + dịch vụ chi tiết thật — dùng đúng cái này
    for (const group of parsedGroups) {
      for (const service of group.services) {
        rows.push({
          quote_id: quoteId,
          service_name: serviceName,
          category: group.category,
          title: service,
          sort_order: nextOrder++,
        });
      }
    }
  } else {
    // Không phân tích được — dùng bộ bước chung mặc định
    const template = getMilestoneTemplate(serviceName);
    for (const title of template) {
      rows.push({
        quote_id: quoteId,
        service_name: serviceName,
        category: null,
        title,
        sort_order: nextOrder++,
      });
    }
  }

  const { error } = await supabase.from("project_milestones").insert(rows);
  if (error) {
    console.error("generateMilestonesForService error:", error);
  }
}

export async function removeMilestonesForService(
  quoteId: string,
  serviceName: string,
) {
  const { error } = await supabase
    .from("project_milestones")
    .delete()
    .eq("quote_id", quoteId)
    .eq("service_name", serviceName);

  if (error) console.error(error);
}

// TỰ ĐỘNG "vá" milestone còn thiếu cho 1 Quote — so sánh danh sách
// Service thật (quote_items) với milestone đã có, Service nào chưa
// có milestone thì sinh bù ngay. Gọi hàm này mỗi khi mở tab Progress
// — dùng được cho CẢ Quote mới lẫn Quote cũ tạo trước khi có tính
// năng này, không cần chạy script riêng.
export async function ensureMilestonesForQuote(quoteId: string) {
  const { data: items } = await supabase
    .from("quote_items")
    .select("service_name, description")
    .eq("quote_id", quoteId);

  if (!items || items.length === 0) return;

  const { data: existingMilestones } = await supabase
    .from("project_milestones")
    .select("service_name")
    .eq("quote_id", quoteId);

  const existingServiceNames = new Set(
    (existingMilestones || []).map((m) => m.service_name),
  );

  for (const item of items) {
    if (!existingServiceNames.has(item.service_name)) {
      await generateMilestonesForService(
        quoteId,
        item.service_name,
        item.description,
      );
    }
  }
}

export async function toggleMilestone(id: string, completed: boolean) {
  const { error } = await supabase
    .from("project_milestones")
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export function calculateProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.is_completed).length;
  return Math.round((completed / milestones.length) * 100);
}

// Gom 3 TẦNG: Department (service_name) > Category > danh sách item
export interface CategoryGroup {
  category: string | null;
  items: Milestone[];
}
export interface ServiceGroup {
  serviceName: string;
  categories: CategoryGroup[];
}

export function groupHierarchical(milestones: Milestone[]): ServiceGroup[] {
  const serviceMap = new Map<string, Map<string | null, Milestone[]>>();

  for (const m of milestones) {
    if (!serviceMap.has(m.service_name)) {
      serviceMap.set(m.service_name, new Map());
    }
    const catMap = serviceMap.get(m.service_name)!;
    const catKey = m.category;
    if (!catMap.has(catKey)) catMap.set(catKey, []);
    catMap.get(catKey)!.push(m);
  }

  return Array.from(serviceMap.entries()).map(([serviceName, catMap]) => ({
    serviceName,
    categories: Array.from(catMap.entries()).map(([category, items]) => ({
      category,
      items,
    })),
  }));
}

// Giữ lại để tương thích — gom phẳng theo Service (không chia Category)
export function groupByService(
  milestones: Milestone[],
): { serviceName: string; items: Milestone[] }[] {
  const map = new Map<string, Milestone[]>();
  for (const m of milestones) {
    if (!map.has(m.service_name)) map.set(m.service_name, []);
    map.get(m.service_name)!.push(m);
  }
  return Array.from(map.entries()).map(([serviceName, items]) => ({
    serviceName,
    items,
  }));
}
