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

const assignments = [
  {
    id: "A-001",
    client: "ABC Construction",
    department: "Strategic Operations",
    staff: "Uyen Truong",
    role: "Web Administrator",
    hours: "20 hrs/week",
    status: "Active",
  },

  {
    id: "A-002",
    client: "XYZ Logistics",
    department: "Focused Marketing",
    staff: "Martha Johnson",
    role: "Marketing Specialist",
    hours: "15 hrs/week",
    status: "Active",
  },

  {
    id: "A-003",
    client: "Global Transport",
    department: "Targeted Sales",
    staff: "Amy Wilson",
    role: "Sales Coordinator",
    hours: "10 hrs/week",
    status: "Pending",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";

    case "Pending":
      return "bg-yellow-100 text-yellow-700";

    case "Completed":
      return "bg-blue-100 text-blue-700";

    default:
      return "";
  }
}

export function AssignmentsTable() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Assignment Management</h2>

        <p className="text-sm text-slate-500 mt-1">
          Track client assignments and staff workload.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assigned Staff</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.id}</TableCell>

                <TableCell>{assignment.client}</TableCell>

                <TableCell>{assignment.department}</TableCell>

                <TableCell>{assignment.staff}</TableCell>

                <TableCell>{assignment.role}</TableCell>

                <TableCell>{assignment.hours}</TableCell>

                <TableCell>
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <Link href={`/assignments/${assignment.id}`}>
                        <DropdownMenuItem>View Assignment</DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem>Reassign Staff</DropdownMenuItem>

                      <DropdownMenuItem>Update Hours</DropdownMenuItem>
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
