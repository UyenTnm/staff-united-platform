"use client";

interface PortalAuthLayoutProps {
  children: React.ReactNode;
}

// Layout Glassmorphism — nền gradient phủ TOÀN màn hình, mascot bên
// trái, form bên phải là 1 tấm "kính mờ" (bg-white/10 + backdrop-blur)
// nổi lên trên nền gradient. Dùng chung cho Login / Set Password /
// Forgot Password.
export function PortalAuthLayout({ children }: PortalAuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 px-4 py-10">
      {/* Họa tiết nền trang trí — vòng tròn mờ, phủ toàn trang */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Khung chính — kính mờ lớn chứa cả mascot + form */}
      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        {/* Panel trái — mascot — ẩn trên mobile */}
        <div className="hidden w-1/2 flex-col items-center justify-center px-10 py-14 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            STAFF United
          </p>
          <h1 className="mt-3 text-center text-2xl font-bold text-white">
            Welcome to your Client Portal
          </h1>
          <p className="mt-2 max-w-xs text-center text-sm text-slate-300">
            View your transaction history, proposals, and receipts — all in one
            place.
          </p>

          <div className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-wave.png"
              alt="STAFF United Assistant"
              className="h-72 w-auto"
              style={{
                filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.45))",
              }}
            />
          </div>
        </div>

        {/* Panel phải — form kính mờ */}
        <div className="w-full border-white/10 px-6 py-12 sm:px-10 lg:w-1/2 lg:border-l">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              STAFF United
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/*
============================================================
KHI CÓ FILE RIVE (.riv) THẬT — xem hướng dẫn tích hợp ở phiên bản
trước, thay <img> bằng <RiveComponent> tương tự.
============================================================
*/
