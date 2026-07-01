"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
import { useAuth } from "./auth/auth-provider";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { employee } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // const menuItems = [
  //   {
  //     label: "Dashboard",
  //     href: "/dashboard",
  //   },

  //   {
  //     label: "Employees",
  //     href: "/employees",
  //   },

  //   {
  //     label: "Assets",
  //     href: "/assets",
  //   },

  //   {
  //     label: "CRM",
  //     href: "/crm",
  //   },
  //   {
  //     label: "Quotes",
  //     href: "/crm/quotes",
  //   },
  //   {
  //     label: "Clients",
  //     href: "/clients",
  //   },

  //   {
  //     label: "Assignments",
  //     href: "/assignments",
  //   },

  //   {
  //     label: "Reports",
  //     href: "/reports",
  //   },

  //   {
  //     label: "Settings",
  //     href: "/settings",
  //   },
  // ];

  const ADMIN_MENU = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },

    {
      label: "Employees",
      href: "/employees",
    },

    {
      label: "Pending Reviews",
      href: "/reviews/pending",
    },

    {
      label: "Pending Kaizens",
      href: "/kaizens/pending",
    },

    {
      label: "Approved Kaizens",
      href: "/kaizens/approved",
    },
  ];

  const HR_MENU = [
    // {
    //   label: "Dashboard",
    //   href: "/dashboard",
    // },

    {
      label: "Employees",
      href: "/employees",
    },

    {
      label: "Pending Reviews",
      href: "/reviews/pending",
    },

    {
      label: "Pending Kaizens",
      href: "/kaizens/pending",
    },

    {
      label: "Approved Kaizens",
      href: "/kaizens/approved",
    },
    {
      label: "Rewarded Kaizens",
      href: "/kaizens/rewarded",
    },
  ];

  const MANAGER_MENU = [
    {
      label: "Employees",
      href: "/employees",
    },

    {
      label: "Pending Reviews",
      href: "/reviews/pending",
    },

    {
      label: "Pending Kaizens",
      href: "/kaizens/pending",
    },
  ];

  const EMPLOYEE_MENU = [
    {
      label: "My Performance",
      href: "/performance",
    },
    {
      label: "My Kaizens",
      href: "/performance/kaizen",
    },
  ];

  let menuItems = HR_MENU;

  switch (employee?.user_role) {
    case "Admin":
      menuItems = ADMIN_MENU;
      break;

    case "HR":
      menuItems = HR_MENU;
      break;

    case "Manager":
      menuItems = MANAGER_MENU;
      break;

    case "Employee":
      menuItems = EMPLOYEE_MENU;
      break;
  }

  async function handleLogout() {
    try {
      await signOut();

      router.replace("/login");
    } catch (error) {
      console.error(error);

      toast.error("Logout failed.");
    }
  }

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
          let isActive = false;

          // Review Kaizen từ Pending Kaizens
          const isKaizenReviewPage =
            pathname.includes("/kaizen/") && pathname.includes("/edit");

          // Pending Kaizens
          if (item.href === "/kaizens/pending") {
            isActive =
              pathname.startsWith("/kaizens/pending") || isKaizenReviewPage;
          }

          // Employees
          else if (item.href === "/employees") {
            isActive = pathname.startsWith("/employees") && !isKaizenReviewPage;
          }

          // My Performance
          else if (item.href === "/performance") {
            isActive = pathname === "/performance";
          }

          // Các menu còn lại
          else {
            isActive = pathname.startsWith(item.href);
          }
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
                {!collapsed && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
            "text-slate-400 hover:bg-slate-900 hover:text-red-400",
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
