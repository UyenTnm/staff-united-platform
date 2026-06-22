"use client";

import Link from "next/link";

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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

const clients = [
  {
    id: "C-001",
    company: "ABC Construction",
    department: "Strategic Operations",
    accountManager: "Uyen Truong",
    monthlyValue: "$2,500 AUD",
    status: "Active",
    startDate: "01 Jun 2026",
  },

  {
    id: "C-002",
    company: "XYZ Logistics",
    department: "Focused Marketing",
    accountManager: "Martha",
    monthlyValue: "$1,800 AUD",
    status: "Active",
    startDate: "12 Jun 2026",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";

    case "Paused":
      return "bg-yellow-100 text-yellow-700";

    case "Closed":
      return "bg-red-100 text-red-700";

    default:
      return "";
  }
}

export function ClientsTable() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Clients Management</h2>

        <p className="text-sm text-slate-500 mt-1">
          Manage all active clients.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Account Manager</TableHead>
              <TableHead>Monthly Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>

                <TableCell>{client.company}</TableCell>

                <TableCell>{client.department}</TableCell>

                <TableCell>{client.accountManager}</TableCell>

                <TableCell>{client.monthlyValue}</TableCell>

                <TableCell>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </TableCell>

                <TableCell>{client.startDate}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <Link href={`/clients/${client.id}`}>
                        <DropdownMenuItem>View Client</DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem>Edit Client</DropdownMenuItem>

                      <DropdownMenuItem>Assign Staff</DropdownMenuItem>
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
