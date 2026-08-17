// lib/milestone-templates.ts
//
// Khuôn mẫu các bước công việc CHUẨN cho từng Department (5 dịch vụ
// lớn của STAFF United) — khi khách chọn dịch vụ nào, hệ thống TỰ
// ĐỘNG sinh đúng các bước này, Sale không tự gõ tên milestone được,
// chỉ được tích ✓ khi hoàn thành.

export const MILESTONE_TEMPLATES: Record<string, string[]> = {
  "Strategic Operations": [
    "Onboarding & requirements gathering",
    "Process documentation & SOP setup",
    "Systems & workflow implementation",
    "Team training & handover",
    "Final review & sign-off",
  ],
  "Targeted Sales": [
    "Onboarding & CRM access setup",
    "Lead research & pipeline setup",
    "Sales process implementation",
    "First month performance review",
    "Ongoing optimization",
  ],
  "Accounting & Legal": [
    "Onboarding & document collection",
    "Bookkeeping system setup",
    "First month reconciliation",
    "Reporting & review",
    "Ongoing monthly cycle established",
  ],
  "Focused Marketing": [
    "Kickoff & brand briefing",
    "Content & creative production",
    "Client review & feedback",
    "Revisions",
    "Final delivery & publishing",
  ],
  "Future Expansion": [
    "Requirements & document collection",
    "Government filing & registration",
    "Business setup coordination",
    "Final documentation handover",
  ],
};

// Nếu tên Service không khớp đúng 1 trong 5 Department (VD: dịch vụ
// tự thêm tay, tên khác) — dùng bộ bước chung mặc định.
export const DEFAULT_MILESTONE_TEMPLATE = [
  "Kickoff & requirements",
  "In progress",
  "Client review",
  "Final delivery",
];

export function getMilestoneTemplate(serviceName: string): string[] {
  return MILESTONE_TEMPLATES[serviceName] || DEFAULT_MILESTONE_TEMPLATE;
}

// Phân tích chuỗi description (do ServiceCatalogPicker sinh ra, dạng
// "Category Name:\n  • Service A\n  • Service B") thành cấu trúc
// Category > Service chi tiết THẬT — đúng những gì khách đã chọn,
// không dùng bước chung chung nữa.
export interface ParsedCategoryGroup {
  category: string;
  services: string[];
}

export function parseServiceDescription(
  description: string,
): ParsedCategoryGroup[] {
  const groups: ParsedCategoryGroup[] = [];
  let current: ParsedCategoryGroup | null = null;

  for (const rawLine of description.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.endsWith(":")) {
      current = { category: line.slice(0, -1), services: [] };
      groups.push(current);
    } else if (line.startsWith("•") && current) {
      current.services.push(line.replace(/^•\s*/, "").trim());
    }
  }

  return groups;
}
