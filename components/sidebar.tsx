"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Shield,
  Box,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
  UsersRound,
  ClipboardCheck,
  Lightbulb,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "./auth/auth-provider";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

export function Sidebar() {
  type MenuSection = {
    title: string;
    icon: LucideIcon;
    items: {
      label: string;
      href: string;
    }[];
  };

  type SidebarItem = {
    label: string;
    href: string;
  };

  type SidebarSection = {
    title: string;
    icon: LucideIcon;
    items: SidebarItem[];
  };

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
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

  const ADMIN_MENU: SidebarSection[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    },

    {
      title: "Employee Management",
      icon: UsersRound,
      items: [
        {
          label: "Employees",
          href: "/employees",
        },
      ],
    },

    {
      title: "Performance Management",
      icon: ClipboardCheck,
      items: [
        {
          label: "Pending Reviews",
          href: "/reviews/pending",
        },
        {
          label: "Monthly Reviews",
          href: "/reviews",
        },
        {
          label: "Quality",
          href: "/quality",
        },
        {
          label: "Behavior",
          href: "/behavior",
        },
      ],
    },

    {
      title: "Kaizen Management",
      icon: Lightbulb,
      items: [
        {
          label: "Pending",
          href: "/kaizens/pending",
        },
        {
          label: "Waiting Verification",
          href: "/kaizens/waiting-verification",
        },
        {
          label: "Rewarded",
          href: "/kaizens/rewarded",
        },
      ],
    },
  ];

  const HR_MENU: SidebarSection[] = [
    {
      title: "Employee Management",
      icon: UsersRound,
      items: [
        {
          label: "Employees",
          href: "/employees",
        },
      ],
    },

    {
      title: "Performance Management",
      icon: ClipboardCheck,
      items: [
        {
          label: "Pending Reviews",
          href: "/reviews/pending",
        },
        {
          label: "Monthly Reviews",
          href: "/reviews",
        },
        {
          label: "Quality",
          href: "/quality",
        },
        {
          label: "Behavior",
          href: "/behavior",
        },
      ],
    },

    {
      title: "Kaizen Management",
      icon: Lightbulb,
      items: [
        {
          label: "Pending",
          href: "/kaizens/pending",
        },

        {
          label: "Waiting Verification",
          href: "/kaizens/waiting-verification",
        },
        {
          label: "Rewarded",
          href: "/kaizens/rewarded",
        },
      ],
    },
  ];

  // const MANAGER_MENU: SidebarSection[] = [
  //   {
  //     title: "Employee Management",
  //     icon: UsersRound,
  //     items: [
  //       {
  //         label: "Employees",
  //         href: "/employees",
  //       },
  //     ],
  //   },

  //   {
  //     title: "Performance Management",
  //     icon: ClipboardCheck,
  //     items: [
  //       {
  //         label: "Pending Reviews",
  //         href: "/reviews/pending",
  //       },
  //       {
  //         label: "Quality",
  //         href: "/quality",
  //       },
  //       {
  //         label: "Behavior",
  //         href: "/behavior",
  //       },
  //     ],
  //   },

  //   {
  //     title: "Kaizen Management",
  //     icon: Lightbulb,
  //     items: [
  //       {
  //         label: "Pending",
  //         href: "/kaizens/pending",
  //       },
  //       {
  //         label: "Waiting Verification",
  //         href: "/kaizens/waiting-verification",
  //       },
  //       {
  //         label: "Rewarded",
  //         href: "/kaizens/rewarded",
  //       },
  //     ],
  //   },
  // ];

  const MANAGER_MENU: SidebarSection[] = [
    {
      title: "Employee Management",
      icon: UsersRound,
      items: [
        {
          label: "Employees",
          href: "/employees",
        },
      ],
    },
    {
      title: "Performance Management",
      icon: ClipboardCheck,
      items: [
        {
          label: "Pending Reviews",
          href: "/reviews/pending",
        },
        {
          label: "Quality Approval",
          href: "/quality/manager",
        },
        {
          label: "Behavior Approval",
          href: "/behavior/manager",
        },
      ],
    },

    {
      title: "Kaizen Management",
      icon: Lightbulb,
      items: [
        {
          label: "Pending",
          href: "/kaizens/pending",
        },
        {
          label: "Waiting Verification",
          href: "/kaizens/waiting-verification",
        },
        {
          label: "Rewarded",
          href: "/kaizens/rewarded",
        },
      ],
    },
  ];

  const EMPLOYEE_MENU: SidebarSection[] = [
    {
      title: "My Workspace",
      icon: UsersRound,
      items: [
        {
          label: "My Performance",
          href: "/performance",
        },
        {
          label: "My Kaizens",
          href: "/performance/kaizen",
        },
      ],
    },
  ];

  let menuItems: SidebarSection[] = HR_MENU;

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
      <nav className="p-4 space-y-6 overflow-y-auto">
        {menuItems.map((section, index) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="mb-2 flex items-center gap-3 px-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                  <section.icon className="h-4 w-4 text-emerald-500" />
                </div>

                {!collapsed && (
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {section.title}
                  </span>
                )}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                let isActive = false;

                if (item.href === "/kaizens/pending") {
                  isActive =
                    pathname.startsWith("/kaizens/pending") ||
                    from === "pending";
                } else if (item.href === "/kaizens/waiting-verification") {
                  isActive =
                    pathname.startsWith("/kaizens/waiting-verification") ||
                    from === "verification";
                } else if (item.href === "/employees") {
                  isActive =
                    pathname.startsWith("/employees") &&
                    !pathname.includes("/kaizen/");
                } else if (item.href === "/performance") {
                  isActive = pathname === "/performance";
                } else {
                  isActive = pathname.startsWith(item.href);
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        "w-full rounded-lg pl-8 pr-3 py-2 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white",
                      )}
                    >
                      {!collapsed && item.label}
                    </button>
                  </Link>
                );
              })}
            </div>
            {/* Divider */}
            {index < menuItems.length - 1 && (
              <div className="mx-2 my-5 border-t border-slate-800" />
            )}
          </div>
        ))}
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
