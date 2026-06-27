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
import Link from "next/link";
import { useEffect, useState } from "react";
import { Employee, getEmployees } from "@/lib/employees/employees";

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-700";

    case "inactive":
      return "bg-slate-100 text-slate-700";

    case "suspended":
      return "bg-red-100 text-red-700";

    default:
      return "";
  }
}

export function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      const data = await getEmployees();

      console.log("Loaded Employees:", data);

      setEmployees(data);

      setLoading(false);
    }

    loadEmployees();
  }, []);

  if (loading) {
    return <Card className="p-6">Loading employees...</Card>;
  }
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
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
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {employee.full_name}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {employee.email}
                  </div>
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-300">
                  {employee.role}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {employee.department}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(employee.created_at).toLocaleDateString()}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/employees/${employee.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
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
