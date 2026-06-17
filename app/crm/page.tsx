import { LeadsTable } from "@/components/crm/leads-table";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import React from "react";

export default function CRMPage() {
  return (
    <>
      {/* <div className="mb-8"></div> */}

      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Sidebar />
        <Header />

        <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12 transition-all duration-300">
          <div className="w-full pt-4">
            {/* Page Header */}
            <div className="mb-8 w-full">
              <h1 className="text-3xl font-bold">CRM</h1>
              <p className="text-muted-foreground">
                Manage leads, quotes, and sales opportunities.
              </p>
            </div>

            <LeadsTable />
          </div>
        </main>
      </div>
    </>
  );
}
