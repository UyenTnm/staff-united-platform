// lib/pdf/generate-receipt.ts

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface ReceiptData {
  quoteNumber: string;
  companyName: string;
  proposalTitle: string;
  amount: string; // đã format sẵn, VD: "₫135,000,000"
  paidDate: string; // đã format sẵn, VD: "August 15, 2026"
  paymentMethod: string; // "VietQR (Bank Transfer)" hoặc "International Wire Transfer"
}

// Tạo file PDF biên lai xác nhận thanh toán — đơn giản, 1 trang,
// không cần trình duyệt ảo (headless browser), chạy nhẹ trên
// serverless/API route.
export async function generateReceiptPdf(
  data: ReceiptData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 700]); // A4-ish, đơn vị point

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const emerald = rgb(0.02, 0.59, 0.41);
  const slateDark = rgb(0.06, 0.09, 0.16);
  const slateGray = rgb(0.44, 0.5, 0.57);

  let y = 650;

  // Header
  page.drawText("STAFF UNITED", {
    x: 50,
    y,
    size: 20,
    font: fontBold,
    color: slateDark,
  });
  y -= 20;
  page.drawText("Payment Receipt", {
    x: 50,
    y,
    size: 11,
    font,
    color: emerald,
  });

  y -= 50;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.9, 0.91, 0.92),
  });

  y -= 40;
  const rows: [string, string][] = [
    ["Receipt No.", data.quoteNumber],
    ["Bill To", data.companyName],
    ["Description", data.proposalTitle],
    ["Payment Method", data.paymentMethod],
    ["Date Paid", data.paidDate],
  ];

  for (const [label, value] of rows) {
    page.drawText(label, { x: 50, y, size: 11, font, color: slateGray });
    page.drawText(value, {
      x: 220,
      y,
      size: 11,
      font: fontBold,
      color: slateDark,
    });
    y -= 28;
  }

  y -= 20;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.9, 0.91, 0.92),
  });

  y -= 40;
  page.drawText("Total Paid", {
    x: 50,
    y,
    size: 13,
    font: fontBold,
    color: slateDark,
  });
  page.drawText(data.amount, {
    x: 380,
    y,
    size: 18,
    font: fontBold,
    color: emerald,
  });

  y -= 80;
  page.drawText("Thank you for your business.", {
    x: 50,
    y,
    size: 10,
    font,
    color: slateGray,
  });

  return pdfDoc.save();
}
