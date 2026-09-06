"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
// @ts-ignore - react-pageflip không có type định nghĩa đầy đủ
import HTMLFlipBookRaw from "react-pageflip";

// Ép kiểu để bỏ qua yêu cầu khai báo đủ mọi prop (type định nghĩa của
// thư viện này bị lỗi, liệt kê prop bắt buộc dù thực tế đều có default).
const HTMLFlipBook = HTMLFlipBookRaw as any;

interface ProposalFlipbookProps {
  pdfUrl: string;
}

// Mỗi trang sách cần forwardRef để react-pageflip điều khiển được animation
const Page = forwardRef<
  HTMLDivElement,
  { imageSrc: string; pageNumber: number }
>(({ imageSrc, pageNumber }, ref) => {
  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center bg-white shadow-inner"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`Page ${pageNumber}`}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
});
Page.displayName = "Page";

// Dùng chung cho mọi client — chỉ cần truyền đúng pdfUrl, tự động
// convert PDF thành flipbook, không hardcode gì riêng.
export function ProposalFlipbook({ pdfUrl }: ProposalFlipbookProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPdfToImages() {
      try {
        // Import động — pdfjs-dist chỉ chạy được trên trình duyệt (client)
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;

        const images: string[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport,
              canvas,
            }).promise;
            images.push(canvas.toDataURL("image/jpeg", 0.85));
          }
        }

        if (!cancelled) {
          setPageImages(images);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to render PDF as flipbook:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderPdfToImages();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl border bg-white">
        <p className="text-sm text-slate-500">Preparing proposal...</p>
      </div>
    );
  }

  if (error || pageImages.length === 0) {
    // Fallback an toàn — nếu convert lỗi (PDF hỏng, mạng chậm...),
    // vẫn cho khách xem qua iframe thường thay vì màn hình trắng.
    return (
      <div className="rounded-xl border bg-white overflow-hidden">
        <iframe
          src={pdfUrl}
          className="w-full h-[600px]"
          title="Proposal PDF"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <HTMLFlipBook
        ref={flipBookRef}
        width={400}
        height={560}
        size="stretch"
        minWidth={280}
        maxWidth={600}
        minHeight={400}
        maxHeight={800}
        showCover={true}
        mobileScrollSupport={true}
        className="shadow-2xl"
      >
        {pageImages.map((src, index) => (
          <Page key={index} imageSrc={src} pageNumber={index + 1} />
        ))}
      </HTMLFlipBook>

      <p className="text-xs text-slate-400">
        Click or drag the corner of the page to flip
      </p>

      {/* Nút tải PDF gốc — dùng đúng file thật, không phải ảnh đã convert */}
      <a
        href={pdfUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        Download PDF
      </a>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState, forwardRef } from "react";
// import HTMLFlipBookRaw from "react-pageflip";

// const HTMLFlipBook = HTMLFlipBookRaw as any;

// interface ProposalFlipbookProps {
//   pdfUrl: string;
// }

// const SpreadPage = forwardRef<
//   HTMLDivElement,
//   { imageSrc: string; pageNumber: number }
// >(({ imageSrc, pageNumber }, ref) => {
//   return (
//     <div
//       ref={ref}
//       className="relative flex items-center justify-center bg-white"
//     >
//       {/* eslint-disable-next-line @next/next/no-img-element */}
//       <img
//         src={imageSrc}
//         alt={`Spread ${pageNumber}`}
//         className="h-full w-full object-contain"
//         draggable={false}
//       />
//     </div>
//   );
// });
// SpreadPage.displayName = "SpreadPage";

// export function ProposalFlipbook({ pdfUrl }: ProposalFlipbookProps) {
//   const [spreadImages, setSpreadImages] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const flipBookRef = useRef<any>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function renderPdfToSpreads() {
//       try {
//         const pdfjsLib = await import("pdfjs-dist");
//         pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

//         const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
//         const pdf = await loadingTask.promise;

//         // Bước 1: render từng trang PDF ra canvas riêng lẻ
//         const pageCanvases: HTMLCanvasElement[] = [];

//         for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//           const page = await pdf.getPage(pageNum);
//           const viewport = page.getViewport({ scale: 2 });

//           const canvas = document.createElement("canvas");
//           const context = canvas.getContext("2d");
//           canvas.width = viewport.width;
//           canvas.height = viewport.height;

//           if (context) {
//             await page.render({
//               canvasContext: context,
//               viewport,
//               canvas,
//             }).promise;
//             pageCanvases.push(canvas);
//           }
//         }

//         // Bước 2: ghép từng cặp 2 trang liên tiếp thành 1 ảnh spread
//         // duy nhất (trang bìa + trang 1 cũng được ghép chung như vậy).
//         const spreads: string[] = [];

//         for (let i = 0; i < pageCanvases.length; i += 2) {
//           const left = pageCanvases[i];
//           const right = pageCanvases[i + 1];

//           const width = left.width + (right ? right.width : left.width);
//           const height = Math.max(left.height, right ? right.height : 0);

//           const merged = document.createElement("canvas");
//           merged.width = width;
//           merged.height = height;

//           const ctx = merged.getContext("2d");
//           if (ctx) {
//             ctx.fillStyle = "#ffffff";
//             ctx.fillRect(0, 0, width, height);
//             ctx.drawImage(left, 0, 0);
//             if (right) {
//               ctx.drawImage(right, left.width, 0);
//             }
//             spreads.push(merged.toDataURL("image/jpeg", 0.85));
//           }
//         }

//         if (!cancelled) {
//           setSpreadImages(spreads);
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Failed to render PDF as flipbook:", err);
//         if (!cancelled) {
//           setError(true);
//           setLoading(false);
//         }
//       }
//     }

//     renderPdfToSpreads();

//     return () => {
//       cancelled = true;
//     };
//   }, [pdfUrl]);

//   if (loading) {
//     return (
//       <div className="flex h-[500px] items-center justify-center rounded-xl border bg-white">
//         <p className="text-sm text-slate-500">Preparing proposal...</p>
//       </div>
//     );
//   }

//   if (error || spreadImages.length === 0) {
//     return (
//       <div className="rounded-xl border bg-white overflow-hidden">
//         <iframe
//           src={pdfUrl}
//           className="w-full h-[600px]"
//           title="Proposal PDF"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center gap-3">
//       <div className="mx-auto flex justify-center" style={{ maxWidth: 900 }}>

//           ref={flipBookRef}
//           width={800}
//           height={560}
//           size="stretch"
//           minWidth={500}
//           maxWidth={900}
//           minHeight={350}
//           maxHeight={630}
//           showCover={false}
//           mobileScrollSupport={true}
//           className="shadow-2xl"
//         >
//           {spreadImages.map((src, index) => (
//             <SpreadPage key={index} imageSrc={src} pageNumber={index + 1} />
//           ))}
//         </HTMLFlipBook>
//       </div>

//       <p className="text-xs text-slate-400">
//         Click or drag the corner of the page to flip
//       </p>

//       <a
//         href={pdfUrl}
//         download
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
//       >
//         Download PDF
//       </a>
//     </div>
//   );
// }
