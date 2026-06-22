"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
