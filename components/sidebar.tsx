"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Box,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },

    {
      label: "Employees",
      href: "/employees",
    },

    {
      label: "Assets",
      href: "/assets",
    },

    {
      label: "CRM",
      href: "/crm",
    },
    {
      label: "Quotes",
      href: "/crm/quotes",
    },
    {
      label: "Clients",
      href: "/clients",
    },

    {
      label: "Assignments",
      href: "/assignments",
    },

    {
      label: "Reports",
      href: "/reports",
    },

    {
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 z-40 hidden md:block",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">
              STAFF United
            </span>{" "}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed ? "rotate-180" : "",
            )}
          />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          // const Icon = item.icon;
          // const isActive = pathname === item.href;
          const isActive =
            item.href === "/crm"
              ? pathname === "/crm"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                )}
              >
                {/* <Icon className="w-5 h-5 flex-shrink-0" /> */}
                {!collapsed && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
            "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium mt-2",
            "text-slate-400 hover:bg-slate-900 hover:text-red-400",
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
