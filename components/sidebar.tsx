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
  ChevronLeft,
  ChevronRight,
  UsersRound,
  ClipboardCheck,
  Lightbulb,
  LayoutDashboard,
  Briefcase,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/auth-provider";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { getTotalUnreadForStaff } from "@/lib/crm/support";
import { playNotifySound, setupAudioUnlock } from "@/lib/notify-sound";

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

// Vị trí nút collapse được lưu lại giữa các lần load, giống cơ chế của Staff Academy
const TOGGLE_BUTTON_HEIGHT = 28;
const TOGGLE_STORAGE_KEY = "staff_platform_sidebar_toggle_position_y";

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
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
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const { employee } = useAuth();

  // Số tin nhắn Support chưa đọc — hiện badge đỏ + phát âm thanh khi
  // có tin mới.
  const [unreadSupport, setUnreadSupport] = useState(0);
  const prevUnreadRef = useRef(0);

  async function checkUnreadSupport() {
    const count = await getTotalUnreadForStaff();
    if (count > prevUnreadRef.current && !pathname.startsWith("/crm/support")) {
      playNotifySound();
    }
    prevUnreadRef.current = count;
    setUnreadSupport(count);
  }

  useEffect(() => {
    setupAudioUnlock();
  }, []);

  useEffect(() => {
    checkUnreadSupport();
    const interval = setInterval(checkUnreadSupport, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  // ============================================================
  // Logic nút collapse kéo-thả (mượn từ Staff Academy) — di chuyển
  // tự do theo chiều dọc trên viền phải sidebar, vị trí được nhớ lại
  // qua localStorage.
  // ============================================================
  const asideRef = useRef<HTMLElement>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);

  const [buttonY, setButtonY] = useState<number>(32);

  const clampY = (y: number) => {
    const asideHeight = asideRef.current?.offsetHeight ?? 800;
    const min = 8;
    const max = asideHeight - TOGGLE_BUTTON_HEIGHT - 8;
    return Math.min(Math.max(y, min), max);
  };

  useEffect(() => {
    const saved = localStorage.getItem(TOGGLE_STORAGE_KEY);
    if (!saved) return;

    const parsed = Number(saved);
    if (Number.isNaN(parsed)) return;

    setButtonY((prev) => {
      const clamped = clampY(parsed);
      return clamped === prev ? prev : clamped;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    movedRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !asideRef.current) return;

    movedRef.current = true;

    const rect = asideRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top - TOGGLE_BUTTON_HEIGHT / 2;

    setButtonY(clampY(relativeY));
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    localStorage.setItem(TOGGLE_STORAGE_KEY, String(buttonY));
  };

  const handleToggleClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setCollapsed((prev) => !prev);
  };

  // ============================================================
  // Menu — giữ nguyên cấu trúc theo role như trước, chỉ thêm CRM
  // ============================================================

  const CRM_SECTION: SidebarSection = {
    title: "CRM",
    icon: Briefcase,
    items: [
      {
        label: "Leads",
        href: "/crm",
      },
      {
        label: "Quotes",
        href: "/crm/quotes",
      },
      {
        label: "Support",
        href: "/crm/support",
      },
    ],
  };

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
          label: "Overview",
          href: "/performance/overview",
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
          href: "/kaizens?tab=pending",
        },
        {
          label: "Waiting Verification",
          href: "/kaizens?tab=verification",
        },
        {
          label: "Approved",
          href: "/kaizens?tab=approved",
        },
        {
          label: "Rewarded",
          href: "/kaizens?tab=rewarded",
        },
      ],
    },
  ];

  const HR_MENU: SidebarSection[] = [
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
          label: "Overview",
          href: "/performance/overview",
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
          href: "/kaizens?tab=pending",
        },
        {
          label: "Waiting Verification",
          href: "/kaizens?tab=verification",
        },
        {
          label: "Approved",
          href: "/kaizens?tab=approved",
        },
        {
          label: "Rewarded",
          href: "/kaizens?tab=rewarded",
        },
      ],
    },
  ];

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
          label: "Overview",
          href: "/performance/overview",
        },

        {
          label: "Quality Approval",
          href: "/quality?tab=manager",
        },
        {
          label: "Behavior Approval",
          href: "/behavior?tab=manager",
        },
      ],
    },

    {
      title: "Kaizen Management",
      icon: Lightbulb,
      items: [
        {
          label: "Pending",
          href: "/kaizens?tab=pending",
        },
        {
          label: "Waiting Verification",
          href: "/kaizens?tab=verification",
        },
        {
          label: "Approved",
          href: "/kaizens?tab=approved",
        },
        {
          label: "Rewarded",
          href: "/kaizens?tab=rewarded",
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

  // CRM giờ HOÀN TOÀN tách biệt khỏi user_role (Admin/HR/Manager/
  // Employee) — chỉ phụ thuộc crm_access. Trước đây CRM bị gắn cứng
  // sẵn vào 3/4 menu, khiến tài khoản "Employee" (mặc định khi tạo
  // mới) không bao giờ thấy CRM dù có crm_access — giờ luôn tự thêm
  // vào đúng vị trí đầu tiên, bất kể user_role gì.
  if (employee?.crm_access) {
    menuItems = [CRM_SECTION, ...menuItems];
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

      case "CRM":
        return "CRM";

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
      ref={asideRef}
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Nút collapse - kéo thả tự do dọc theo viền phải sidebar (giống Staff Academy) */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleToggleClick}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{ top: buttonY }}
        className="absolute -right-3 z-20 flex h-7 w-7 cursor-ns-resize touch-none items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 shadow-md transition-colors hover:bg-emerald-600 hover:text-white"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo Section — kích thước theo tỷ lệ giống Staff Academy (logo to, rõ hơn) */}
      <div
        className={cn(
          "relative border-b border-slate-800 py-6 transition-all duration-300",
          collapsed
            ? "flex items-center justify-center"
            : "flex flex-col items-center justify-center",
        )}
      >
        {/* Logo */}
        {!collapsed ? (
          <div className="flex flex-col items-center" style={{ width: 160 }}>
            <Image
              src="/logo.png"
              alt="STAFF United"
              width={160}
              height={64}
              style={{ width: "auto", height: "auto" }}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        ) : (
          <Image
            src="/logo.png"
            alt="STAFF United"
            width={40}
            height={40}
            style={{ width: "auto", height: "auto" }}
            className="h-10 w-10 object-contain"
            priority
          />
        )}

        {!collapsed && (
          <div className="mt-3 text-center">
            <p className="text-[15px] font-semibold tracking-wide uppercase text-slate-300">
              Performance Platform
            </p>

            <p className="text-[14px] text-slate-500">
              {employee?.user_role === "Admin"
                ? "Administrator"
                : `${employee?.user_role} Portal`}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        {" "}
        {collapsed ? (
          <div className="flex flex-col items-center gap-4 px-0">
            {menuItems.map((section) => {
              const active = pathname.startsWith(getSectionHref(section));
              const showBadge = section.title === "CRM" && unreadSupport > 0;

              return (
                <Tooltip key={section.title}>
                  <TooltipTrigger asChild>
                    <Link href={getSectionHref(section)}>
                      <div
                        className={cn(
                          "relative flex h-20 w-16 items-center justify-center flex-col rounded-2xl border transition-all duration-300",
                          active
                            ? "border-emerald-500 bg-emerald-600 shadow-xl shadow-emerald-600/30 text-white "
                            : "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg",
                        )}
                      >
                        <section.icon className="mb-2 h-6 w-6" />

                        <span className="px-1 text-center text-[10px] leading-tight">
                          {getSectionLabel(section.title)}
                        </span>

                        {showBadge && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadSupport > 9 ? "9+" : unreadSupport}
                          </span>
                        )}
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

                    if (item.href === "/kaizens?tab=pending") {
                      isActive =
                        (pathname === "/kaizens" &&
                          (currentTab === "pending" || !currentTab)) ||
                        from === "pending";
                    } else if (item.href === "/kaizens?tab=verification") {
                      isActive =
                        (pathname === "/kaizens" &&
                          currentTab === "verification") ||
                        from === "verification";
                    } else if (item.href === "/kaizens?tab=approved") {
                      isActive =
                        (pathname === "/kaizens" &&
                          currentTab === "approved") ||
                        from === "approved";
                    } else if (item.href === "/kaizens?tab=rewarded") {
                      isActive =
                        (pathname === "/kaizens" &&
                          currentTab === "rewarded") ||
                        from === "reward";
                    } else if (item.href === "/quality?tab=manager") {
                      isActive =
                        pathname === "/quality" && currentTab === "manager";
                    } else if (item.href === "/behavior?tab=manager") {
                      isActive =
                        pathname === "/behavior" && currentTab === "manager";
                    } else if (item.href === "/employees") {
                      isActive =
                        pathname.startsWith("/employees") &&
                        !pathname.includes("/kaizen/");
                    } else if (item.href === "/performance") {
                      isActive = pathname === "/performance";
                    } else if (item.href === "/reviews") {
                      isActive = pathname === "/reviews";
                    } else if (item.href === "/crm") {
                      isActive =
                        pathname === "/crm" ||
                        pathname.startsWith("/crm/leads");
                    } else if (item.href === "/crm/quotes") {
                      isActive = pathname.startsWith("/crm/quotes");
                    } else if (item.href === "/crm/support") {
                      isActive = pathname.startsWith("/crm/support");
                    } else {
                      isActive = pathname.startsWith(item.href.split("?")[0]);
                    }

                    const itemUnread =
                      item.href === "/crm/support" ? unreadSupport : 0;

                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "flex items-center justify-between rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-emerald-600 shadow-xl shadow-emerald-600/30 text-white"
                              : "text-slate-300 hover:bg-slate-900 hover:shadow-lg hover:text-white",
                          )}
                        >
                          <span>{item.label}</span>
                          {itemUnread > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                              {itemUnread > 9 ? "9+" : itemUnread}
                            </span>
                          )}
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
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer",
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
