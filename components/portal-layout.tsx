"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Building2,
  ShoppingCart,
  FileText,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUnreadCountForClient } from "@/lib/crm/support";
import { playNotifySound, setupAudioUnlock } from "@/lib/notify-sound";

interface PortalLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

// Layout chuẩn cho Client Portal — sidebar cố định, dễ mở rộng thêm
// mục sau này (Profile, Invoices, Support...) khi scale up.
export function PortalLayout({ children, userEmail }: PortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadSupport, setUnreadSupport] = useState(0);
  const prevUnreadRef = useRef(0);

  async function checkUnread() {
    if (!userEmail) return;
    const count = await getUnreadCountForClient(userEmail);

    // Nếu số tin chưa đọc TĂNG lên (có tin mới) và không đang ở
    // ngay trang Support — phát âm thanh nhẹ báo có tin mới.
    if (count > prevUnreadRef.current && pathname !== "/portal/support") {
      playNotifySound();
    }
    prevUnreadRef.current = count;
    setUnreadSupport(count);
  }

  useEffect(() => {
    setupAudioUnlock();
  }, []);

  useEffect(() => {
    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [userEmail, pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent
          userEmail={userEmail}
          onLogout={handleLogout}
          pathname={pathname}
          unreadSupport={unreadSupport}
        />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-64 flex-col bg-white">
            <SidebarContent
              userEmail={userEmail}
              onLogout={handleLogout}
              pathname={pathname}
              unreadSupport={unreadSupport}
            />
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
  pathname,
  unreadSupport,
}: {
  userEmail: string;
  onLogout: () => void;
  pathname: string;
  unreadSupport: number;
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
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Transaction History
        </a>
        <a
          href="/portal/projects"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal/projects"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Projects
        </a>
        <a
          href="/portal/profile"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal/profile"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Company Profile
        </a>
        <a
          href="/portal/request-services"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal/request-services"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Request Services
        </a>
        <a
          href="/portal/documents"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal/documents"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-4 w-4" />
          Documents
        </a>
        <a
          href="/portal/support"
          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/portal/support"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4" />
            Support
          </span>
          {unreadSupport > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadSupport > 9 ? "9+" : unreadSupport}
            </span>
          )}
        </a>
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
