"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PortalLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

// Layout chuẩn cho Client Portal — sidebar cố định, dễ mở rộng thêm
// mục sau này (Profile, Invoices, Support...) khi scale up.
export function PortalLayout({ children, userEmail }: PortalLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent userEmail={userEmail} onLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-64 flex-col bg-white">
            <SidebarContent userEmail={userEmail} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile only, has hamburger toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-slate-900">
            STAFF United Portal
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            className="cursor-pointer text-slate-500"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex-1 px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="border-b border-slate-100 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          STAFF United
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">Client Portal</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <a
          href="/portal"
          className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700"
        >
          <LayoutDashboard className="h-4 w-4" />
          Transaction History
        </a>
        {/* Chỗ mở rộng sau này: Profile, Invoices, Support... */}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="truncate px-2 text-xs text-slate-400">{userEmail}</p>
        <button
          onClick={onLogout}
          className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </>
  );
}
