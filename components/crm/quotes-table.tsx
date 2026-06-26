"use client";
import React, { useEffect, useState } from "react";
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
import { getQuotes, Quote } from "@/lib/quotes";
import Link from "next/link";

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      const data = await getQuotes();

      setQuotes(data);

      setLoading(false);
    }

    loadQuotes();
  }, []);

  if (loading) {
    return <Card className="p-6">Loading Quotes...</Card>;
  }

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
                {/* <TableCell>{quote.id}</TableCell> */}
                <TableCell>{quote.quote_number}</TableCell>

                <TableCell>{quote.company_name}</TableCell>
                <TableCell>{quote.department}</TableCell>

                <TableCell>${quote.amount.toLocaleString()} AUD</TableCell>

                <TableCell>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(quote.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/crm/quotes/${quote.id}`}>View Quote</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href={`/crm/quotes/${quote.id}/edit`}>
                          Edit Quote
                        </Link>
                      </DropdownMenuItem>

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
