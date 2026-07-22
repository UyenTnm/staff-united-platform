import Link from "next/link";
import { Users, FileText, UserCircle, Plus, ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Leads",
    description: "Manage all incoming leads.",
    href: "/crm/leads",
    icon: Users,
  },
  {
    title: "Clients",
    description: "View all active clients.",
    href: "/clients",
    icon: UserCircle,
  },
  {
    title: "Quotes",
    description: "Create and manage quotations.",
    href: "/crm/quotes",
    icon: FileText,
  },
];

const stats = [
  {
    title: "Open Leads",
    value: "--",
    color: "text-blue-600",
  },
  {
    title: "Active Clients",
    value: "--",
    color: "text-emerald-600",
  },
  {
    title: "Draft Quotes",
    value: "--",
    color: "text-orange-600",
  },
  {
    title: "Sent Quotes",
    value: "--",
    color: "text-purple-600",
  },
];

export default function CRMPage() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>

          <p className="mt-2 text-slate-500">
            Manage leads, clients and quotations.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/crm/leads"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Link>

          <Link
            href="/crm/quotes/new"
            className="inline-flex items-center rounded-xl border px-5 py-3 font-medium hover:bg-slate-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>

            <h2 className={`mt-3 text-4xl font-bold ${item.color}`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Modules */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <Icon className="h-7 w-7 text-emerald-600" />
              </div>

              <h2 className="mt-6 text-xl font-semibold">{card.title}</h2>

              <p className="mt-2 text-sm text-slate-500">{card.description}</p>

              <div className="mt-6 flex items-center font-medium text-emerald-600">
                Open Module
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Coming Soon */}

      <div className="rounded-2xl border border-dashed p-8">
        <h2 className="text-lg font-semibold">Coming Soon</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 text-slate-500">Contracts</div>

          <div className="rounded-xl border p-4 text-slate-500">Invoices</div>

          <div className="rounded-xl border p-4 text-slate-500">Payments</div>
        </div>
      </div>
    </div>
  );
}
