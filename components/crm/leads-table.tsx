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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";

const leads = [
  {
    id: "L-001",
    company: "ABC Construction",
    contact: "John Smith",
    department: "Strategic Operations",
    status: "New",
    priority: "High",
    created: "17 Jun 2026",
  },
  {
    id: "L-002",
    company: "XYZ Logistics",
    contact: "Sarah Lee",
    department: "Focused Marketing",
    status: "Contacted",
    priority: "Medium",
    created: "16 Jun 2026",
  },
  {
    id: "L003",
    company: "Global Transport",
    contact: "David Brown",
    department: "Focused Marketing",
    status: "Quoted",
    priority: "Low",
    created: "16 August 2026",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700";
    case "Contacted":
      return "bg-yellow-100 text-yellow-700";
    case "Quoted":
      return "bg-green-100 text-green-700";
    default:
      return "";
  }
}

export function LeadsTable() {
  return (
    <Card>
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Leads</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Manage incoming sales opportunities.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead ID</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.id}</TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.contact}</TableCell>
              <TableCell>{lead.department}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>{lead.priority}</TableCell>
              <TableCell>{lead.created}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href={`/crm/leads/${lead.id}`}>View Details</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>Assign Lead</DropdownMenuItem>

                    <DropdownMenuItem>Create Quote</DropdownMenuItem>

                    <DropdownMenuItem>Convert To Client</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
