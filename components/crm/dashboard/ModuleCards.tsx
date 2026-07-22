import Link from "next/link";
import { Users, UserCircle, FileText, ArrowRight } from "lucide-react";

const modules = [
  {
    title: "Leads",
    description: "Manage incoming enquiries and sales opportunities.",
    href: "/crm",
    icon: Users,
  },
  {
    title: "Clients",
    description: "View and manage all active clients.",
    href: "/clients",
    icon: UserCircle,
  },
  {
    title: "Quotes",
    description: "Create, edit and send quotations.",
    href: "/crm/quotes",
    icon: FileText,
  },
];

export default function ModuleCards() {
  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold">CRM Modules</h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.title}
              href={module.href}
              className="group rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <Icon className="h-7 w-7 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">{module.title}</h3>

              <p className="mt-2 text-sm text-slate-500">
                {module.description}
              </p>

              <div className="mt-6 flex items-center text-sm font-medium text-emerald-600">
                Open Module
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
