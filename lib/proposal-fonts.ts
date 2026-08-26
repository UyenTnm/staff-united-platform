// lib/proposal-fonts.ts
//
// Danh sách font ĐÃ DUYỆT cho proposal — giới hạn để tránh sale chọn
// font lạ làm hỏng layout. `value` là tên font gốc (lưu vào DB,
// dùng làm googleParam prefix), `label` chỉ để hiển thị trong UI.

export interface ProposalFontOption {
  value: string; // lưu vào quotes.font_heading / font_body
  label: string; // hiển thị trong dropdown
  cssName: string; // dùng trong style={{ fontFamily: ... }}
  googleParam: string; // family param cho URL fonts.googleapis.com
}

export const HEADING_FONTS: ProposalFontOption[] = [
  {
    value: "Playfair Display",
    label: "Playfair Display (default)",
    cssName: "'Playfair Display', serif",
    googleParam: "Playfair+Display:wght@600;700;800",
  },
  {
    value: "Merriweather",
    label: "Merriweather",
    cssName: "'Merriweather', serif",
    googleParam: "Merriweather:wght@700;900",
  },
  {
    value: "Montserrat",
    label: "Montserrat",
    cssName: "'Montserrat', sans-serif",
    googleParam: "Montserrat:wght@700;800",
  },
  {
    value: "Libre Baskerville",
    label: "Libre Baskerville",
    cssName: "'Libre Baskerville', serif",
    googleParam: "Libre+Baskerville:wght@700",
  },
];

export const BODY_FONTS: ProposalFontOption[] = [
  {
    value: "Poppins",
    label: "Poppins (default)",
    cssName: "'Poppins', sans-serif",
    googleParam: "Poppins:wght@400;500;600",
  },
  {
    value: "Inter",
    label: "Inter",
    cssName: "'Inter', sans-serif",
    googleParam: "Inter:wght@400;500;600",
  },
  {
    value: "Lato",
    label: "Lato",
    cssName: "'Lato', sans-serif",
    googleParam: "Lato:wght@400;700",
  },
  {
    value: "Source Sans 3",
    label: "Source Sans 3",
    cssName: "'Source Sans 3', sans-serif",
    googleParam: "Source+Sans+3:wght@400;600",
  },
];

export function findFont(
  list: ProposalFontOption[],
  value: string | null | undefined,
): ProposalFontOption {
  return list.find((f) => f.value === value) ?? list[0];
}

export function buildGoogleFontsHref(fonts: ProposalFontOption[]): string {
  const families = fonts.map((f) => `family=${f.googleParam}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
