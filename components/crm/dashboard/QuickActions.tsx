import Link from "next/link";
import { Plus, Users, FileText, LayoutDashboard } from "lucide-react";

const actions = [
  {
    title: "New Lead",
    href: "/crm/leads",
    icon: Plus,
  },
  {
    title: "New Quote",
    href: "/crm/quotes/new",
    icon: FileText,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "CRM Home",
    href: "/crm",
    icon: LayoutDashboard,
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Quick Actions</h2>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-4 rounded-xl border p-4 transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <div className="rounded-lg bg-emerald-100 p-2">
                <Icon className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="font-medium">{action.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
