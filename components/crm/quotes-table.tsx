"use client";
import React from "react";
import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

const quotes = [
  {
    id: "Q-0001",
    company: "ABC Construction",
    department: "Strategic Operations",
    amount: "$2,500 AUD",
    status: "Draft",
    created: "17 Jun 2026",
  },
  {
    id: "Q-0002",
    company: "XYZ Logistics",
    department: "Focused Marketing",
    amount: "$1,800 AUD",
    status: "Sent",
    created: "16 Jun 2026",
  },
  {
    id: "Q-0003",
    company: "Global Transport",
    department: "Targeted Sales",
    amount: "$3,200 AUD",
    status: "Accepted",
    created: "15 Jun 2026",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700";

    case "Sent":
      return "bg-blue-100 text-blue-700";

    case "Accepted":
      return "bg-emerald-100 text-emerald-700";

    case "Rejected":
      return "bg-red-100 text-red-700";

    default:
      return "";
  }
}

export function QuotesTable() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/5">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold">Quotes Management</h2>
        <p className="text-sm text-slate-500 mt-1">
          Track and manage all sales quotations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-rigt">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{quote.id}</TableCell>
                <TableCell>{quote.company}</TableCell>
                <TableCell>{quote.department}</TableCell>
                <TableCell>{quote.amount}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell>{quote.created}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Quote</DropdownMenuItem>

                      <DropdownMenuItem>Edit Quote</DropdownMenuItem>

                      <DropdownMenuItem>Send Quote</DropdownMenuItem>

                      <DropdownMenuItem>Convert To Client</DropdownMenuItem>
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
