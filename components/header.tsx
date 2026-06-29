"use client";

import { Bell, ChevronDown, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useAuth } from "./auth/auth-provider";

export function Header() {
  const router = useRouter();

  const { employee, loading } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  // Ensure component is mounted before rendering theme switcher

  async function handleLogout() {
    await signOut();

    router.replace("/login");
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b z-30 transition-all duration-300">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search users, systems..."
              className="pl-10 border-0 text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 transition"
            >
              <User className="w-5 h-5 text-slate-600" />

              <div className="text-left">
                <p className="text-sm font-semibold">
                  {loading ? "Loading..." : employee?.full_name}
                </p>

                <p className="text-xs text-slate-500">{employee?.user_role}</p>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-lg">
                <button className="w-full px-4 py-3 text-left hover:bg-slate-50">
                  My Profile
                </button>

                <button className="w-full px-4 py-3 text-left hover:bg-slate-50">
                  Settings
                </button>

                <hr />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
