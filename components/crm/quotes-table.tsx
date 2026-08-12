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
import { MoreHorizontal, FileText } from "lucide-react";
import { getQuotes, Quote } from "@/lib/crm/quotes";
import Link from "next/link";

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case "Sent":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "Viewed":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Accepted":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Paid":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "Rejected":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

function CompanyAvatar({ name }: { name: string }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      {initial}
    </div>
  );
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
    return (
      <Card className="p-6 text-sm text-slate-500">Loading quotes...</Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/5">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Quotes Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Track and manage all sales quotations.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            No quotes yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Create a quote from a lead to get started.
          </p>
        </div>
      ) : (
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {quotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <TableCell className="font-mono text-xs text-slate-500">
                    {quote.quote_number}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={quote.company_name} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {quote.company_name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500">
                    {quote.department}
                  </TableCell>

                  {/* Null-safe: quote.amount có thể là null nếu quote
                      dùng Service Options thay vì field amount cũ. */}
                  <TableCell className="font-medium">
                    ${Number(quote.amount ?? 0).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-slate-500">
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
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/quotes/${quote.id}`}>
                            View Quote
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href={`/crm/quotes/${quote.id}/edit`}>
                            Edit Quote
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
