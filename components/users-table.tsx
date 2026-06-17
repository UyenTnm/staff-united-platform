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
import { MoreHorizontal, Mail, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Anderson",
    email: "sarah.anderson@company.com",
    role: "Admin",
    department: "IT Security",
    status: "active",
    lastLogin: "2 hours ago",
  },
  {
    id: "2",
    name: "Marcus Chen",
    email: "marcus.chen@company.com",
    role: "Security Officer",
    department: "IT Security",
    status: "active",
    lastLogin: "15 minutes ago",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    role: "Manager",
    department: "Operations",
    status: "active",
    lastLogin: "1 day ago",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@company.com",
    role: "Developer",
    department: "Engineering",
    status: "active",
    lastLogin: "3 hours ago",
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "lisa.park@company.com",
    role: "Analyst",
    department: "Finance",
    status: "inactive",
    lastLogin: "30 days ago",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "inactive":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    case "suspended":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "";
  }
}

export function UsersTable() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 col-span-1 md:col-span-2">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Employees Management
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage employees accounts and access permissions
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-600 dark:text-slate-400">
                Name
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Email
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Role
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Department
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Status
              </TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">
                Last Login
              </TableHead>
              <TableHead className="text-right text-slate-600 dark:text-slate-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow
                key={user.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {user.name}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300">
                  {user.role}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {user.department}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {user.lastLogin}
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        Suspend User
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
