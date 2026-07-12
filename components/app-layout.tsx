"use client";

import { useState } from "react";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "./auth/auth-guard";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <Header collapsed={collapsed} />

        <main
          className={`pt-20 px-4 md:px-6 pb-12 transition-all duration-300 ${
            collapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="w-full">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
