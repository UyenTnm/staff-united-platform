"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Server, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface System {
  id: string;
  name: string;
  type: string;
  users: number;
  status: "operational" | "degraded" | "maintenance";
  uptime: string;
  lastUpdate: string;
}

const mockSystems: System[] = [
  {
    id: "1",
    name: "Core Authentication",
    type: "Auth Service",
    users: 1254,
    status: "operational",
    uptime: "99.98%",
    lastUpdate: "2 days ago",
  },
  {
    id: "2",
    name: "Enterprise Database",
    type: "Database",
    users: 847,
    status: "operational",
    uptime: "99.95%",
    lastUpdate: "5 hours ago",
  },
  {
    id: "3",
    name: "API Gateway",
    type: "Service",
    users: 2103,
    status: "operational",
    uptime: "99.99%",
    lastUpdate: "1 hour ago",
  },
  {
    id: "4",
    name: "File Storage",
    type: "Storage",
    users: 654,
    status: "degraded",
    uptime: "98.52%",
    lastUpdate: "30 minutes ago",
  },
  {
    id: "5",
    name: "Analytics Platform",
    type: "Analytics",
    users: 523,
    status: "operational",
    uptime: "99.87%",
    lastUpdate: "12 hours ago",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "operational":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "degraded":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "maintenance":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "";
  }
}

export function SystemsTable() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 col-span-1 md:col-span-2">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Access
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor system status and user access
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-600 dark:text-slate-400">
                System Name
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Type
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Active Users
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Status
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Uptime
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Last Update
              </TableHead>
              <TableHead className="text-right text-slate-600 dark:text-slate-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSystems.map((system) => (
              <TableRow
                key={system.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-500" />
                    {system.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {system.type}
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300">
                  {system.users}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(system.status)}>
                    {system.status.charAt(0).toUpperCase() +
                      system.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {system.uptime}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {system.lastUpdate}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Metrics</DropdownMenuItem>
                      <DropdownMenuItem>Manage Access</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      <DropdownMenuItem className="text-blue-600 dark:text-blue-400">
                        Schedule Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
