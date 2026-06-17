"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  Smartphone,
  HardDrive,
  Network,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Asset {
  id: string;
  name: string;
  type: "laptop" | "mobile" | "server" | "network";
  owner: string;
  status: "active" | "inactive" | "retired";
  os: string;
  lastScanned: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "MacBook Air M4",
    type: "laptop",
    owner: "Uyen Truong",
    status: "active",
    os: "macOS Sequoia",
    lastScanned: "Today",
  },
  {
    id: "2",
    name: "Mac Mini",
    type: "server",
    owner: "STAFF United",
    status: "active",
    os: "macOS Sequoia",
    lastScanned: "Today",
  },
  {
    id: "3",
    name: "iPhone 16",
    type: "mobile",
    owner: "Martha",
    status: "active",
    os: "iOS 26",
    lastScanned: "Today",
  },
  {
    id: "4",
    name: "Server Rack A-12",
    type: "server",
    owner: "IT Department",
    status: "active",
    os: "Ubuntu 22.04 LTS",
    lastScanned: "15 minutes ago",
  },
  {
    id: "5",
    name: "Core Router 02",
    type: "network",
    owner: "Network Ops",
    status: "active",
    os: "Cisco IOS",
    lastScanned: "1 day ago",
  },
  {
    id: "6",
    name: "iPad Air - OLD4K1",
    type: "mobile",
    owner: "James Wilson",
    status: "inactive",
    os: "iPadOS 16.2",
    lastScanned: "45 days ago",
  },
];

function getAssetIcon(type: string) {
  switch (type) {
    case "laptop":
      return Laptop;
    case "mobile":
      return Smartphone;
    case "server":
      return HardDrive;
    case "network":
      return Network;
    default:
      return Laptop;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "inactive":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    case "retired":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "";
  }
}

export function AssetInventory() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 col-span-1 lg:col-span-2">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Company Assets
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage company equipment and employee assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {mockAssets.map((asset) => {
          const AssetIcon = getAssetIcon(asset.type);

          return (
            <div
              key={asset.id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mt-0.5">
                    <AssetIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {asset.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Asset</DropdownMenuItem>
                    <DropdownMenuItem>Scan Device</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                      Retire Asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Owner:{" "}
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {asset.owner}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    OS:{" "}
                  </span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {asset.os}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status.charAt(0).toUpperCase() +
                      asset.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {asset.lastScanned}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
