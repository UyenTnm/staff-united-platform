import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/crm/leads-table";
import { StatCard } from "@/components/crm/stat-card";
import { getLeads } from "@/lib/crm/leads";

export default async function CRMPage() {
  const leads = await getLeads();

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === "New").length;
  const inProgress = leads.filter(
    (l) => l.status === "Contacted" || l.status === "Client Reviewing",
  ).length;
  const won = leads.filter((l) => l.status === "Won").length;

  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              CRM
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage leads, quotes, and sales opportunities.
            </p>
          </div>

          <Button asChild>
            <Link href="/crm/leads/new">+ New Lead</Link>
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Leads" value={total} accent="slate" />
          <StatCard label="New" value={newCount} accent="blue" />
          <StatCard label="In Progress" value={inProgress} accent="amber" />
          <StatCard label="Won" value={won} accent="emerald" />
        </div>

        <LeadsTable />
      </div>
    </AppLayout>
  );
}
