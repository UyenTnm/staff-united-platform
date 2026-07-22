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
import { useEffect } from "react";
import { useAuth } from "./auth/auth-provider";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  // type MenuSection = {
  //   title: string;
  //   icon: LucideIcon;
  //   items: {
  //     label: string;
  //     href: string;
  //   }[];
  // };

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
  // const [collapsed, setCollapsed] = useState(false);

  const ADMIN_MENU: SidebarSection[] = [
    // Dashboard
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

    // CRM
    {
      title: "CRM",
      icon: Users,
      items: [
        {
          label: "CRM Dashboard",
          href: "/crm",
        },
        {
          label: "Leads",
          href: "/crm/leads",
        },
        {
          label: "Quotes",
          href: "/crm/quotes",
        },
        {
          label: "Clients",
          href: "/clients",
        },
      ],
    },

    // Employee Management
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

    // Performance Management
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
        {
          label: "Returned Reviews",
          href: "/performance/returned",
        },
      ],
    },

    // Kaizen Management
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
          label: "Approved",
          href: "/kaizens/approved",
        },
        {
          label: "Rewarded",
          href: "/kaizens/rewarded",
        },
      ],
    },
  ];

  const HR_MENU: SidebarSection[] = [
    // My Workspace
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

    // CRM
    {
      title: "CRM",
      icon: Users,
      items: [
        {
          label: "CRM Dashboard",
          href: "/crm/dashboard",
        },
        {
          label: "Leads",
          href: "/crm/leads",
        },
        {
          label: "Quotes",
          href: "/crm/quotes",
        },
        {
          label: "Clients",
          href: "/clients",
        },
      ],
    },

    // Employee Management
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

    // Performance Management
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
        {
          label: "Returned Reviews",
          href: "/performance/returned",
        },
      ],
    },

    // Kaizen Management
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
          label: "Approved",
          href: "/kaizens/approved",
        },
        {
          label: "Rewarded",
          href: "/kaizens/rewarded",
        },
      ],
    },
  ];

  const MANAGER_MENU: SidebarSection[] = [
    // Employee Management
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

    // CRM
    {
      title: "CRM",
      icon: Users,
      items: [
        {
          label: "CRM Dashboard",
          href: "/crm/dashboard",
        },
        {
          label: "Leads",
          href: "/crm/leads",
        },
        {
          label: "Quotes",
          href: "/crm/quotes",
        },
        {
          label: "Clients",
          href: "/clients",
        },
      ],
    },

    // Performance Management
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

    // Kaizen Management
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
          label: "Approved",
          href: "/kaizens/approved",
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

  function getSectionLabel(title: string) {
    switch (title) {
      case "Employee Management":
        return "Employees";

      case "Performance Management":
        return "Performance";

      case "Kaizen Management":
        return "Kaizen";

      case "Dashboard":
        return "Dashboard";

      case "My Workspace":
        return "Workspace";

      default:
        return title;
    }
  }

  function getSectionHref(section: SidebarSection) {
    return section.items[0]?.href ?? "/";
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
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "relative h-40 border-b border-slate-800 transition-all duration-300",
          collapsed
            ? "flex items-center justify-center"
            : "flex flex-col items-center justify-center",
        )}
      >
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="STAFF United"
          width={collapsed ? 44 : 100}
          height={collapsed ? 44 : 42}
          priority
          className="transition-all duration-300 object-contain"
        />

        {!collapsed && (
          <div className="mt-3 text-center">
            <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-300">
              Performance Platform
            </p>

            <p className="text-[10px] text-slate-500">
              {employee?.user_role === "Admin"
                ? "Administrator"
                : `${employee?.user_role} Portal`}
            </p>
          </div>
        )}

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            "absolute text-slate-400 hover:text-white hover:bg-slate-800",
            collapsed ? "bottom-0" : "right-3 top-1/2 -translate-y-1/2",
          )}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              collapsed && "rotate-270",
            )}
          />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        {" "}
        {collapsed ? (
          <div className="flex flex-col items-center gap-4 px-0">
            {menuItems.map((section) => {
              const active = pathname.startsWith(getSectionHref(section));

              return (
                <Tooltip key={section.title}>
                  <TooltipTrigger asChild>
                    <Link href={getSectionHref(section)}>
                      <div
                        className={cn(
                          "flex h-20 w-16 items-center justify-center flex-col rounded-2xl border transition-all duration-300",
                          active
                            ? "border-emerald-500 bg-emerald-600 shadow-xl shadow-emerald-600/30 text-white "
                            : "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg",
                        )}
                      >
                        <section.icon className="mb-2 h-6 w-6" />

                        <span className="px-1 text-center text-[10px] leading-tight">
                          {getSectionLabel(section.title)}
                        </span>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <p className="font-medium">{section.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {menuItems.map((section, index) => (
              <div key={section.title}>
                <div className="mb-3 flex items-center gap-3 px-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                    <section.icon className="h-4 w-4 text-emerald-500" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    {section.title}
                  </span>
                </div>

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
                    } else if (item.href === "/kaizens/approved") {
                      isActive =
                        pathname.startsWith("/kaizens/approved") ||
                        from === "approved";
                    } else if (item.href === "/kaizens/rewarded") {
                      isActive =
                        pathname.startsWith("/kaizens/rewarded") ||
                        from === "reward";
                    } else if (item.href === "/employees") {
                      isActive =
                        pathname.startsWith("/employees") &&
                        !pathname.includes("/kaizen/");
                    } else if (item.href === "/performance") {
                      isActive = pathname === "/performance";
                    } else if (item.href === "/reviews") {
                      isActive = pathname === "/reviews";
                    } else {
                      isActive = pathname.startsWith(item.href);
                    }

                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-emerald-600 shadow-xl shadow-emerald-600/30 text-white"
                              : "text-slate-300 hover:bg-slate-900 hover:shadow-lg hover:text-white",
                          )}
                        >
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {index < menuItems.length - 1 && (
                  <div className="my-5 border-t border-slate-800" />
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        {" "}
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
            "text-slate-400 hover:bg-slate-900 hover:shadow-lg hover:text-red-400",
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
