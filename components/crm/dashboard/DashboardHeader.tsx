import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>

        <p className="mt-2 text-slate-500">
          Overview of your sales pipeline and customer relationships.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/crm/leads"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Lead
          </span>
        </Link>

        <Link
          href="/crm/quotes/new"
          className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Quote
          </span>
        </Link>
      </div>
    </div>
  );
}
