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
import { MoreHorizontal, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLeads } from "@/lib/crm/leads";

interface Lead {
  id: string;
  lead_number: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  department: string;
  source: string;
  status: string;
  priority: string;
  created_at: string;

  hasQuote: boolean;
  quoteId: string | null;
}

function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "Contacted":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Proposal Sent":
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    case "Client Reviewing":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Won":
      return "bg-brand-100 text-brand-700 border border-brand-200";
    case "Lost":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

function CompanyAvatar({ name }: { name: string }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
      {initial}
    </div>
  );
}

export function LeadsTable() {
  function formatReceivedTime(date: string) {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return "Yesterday";
    return `${Math.floor(diff / 86400)} days ago`;
  }

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      const data = await getLeads();
      setLeads(data);
      setLoading(false);
    }

    loadLeads();
  }, []);

  if (loading) {
    return <Card className="p-6 text-sm text-slate-500">Loading leads...</Card>;
  }

  const filteredLeads = leads.filter((lead) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      lead.company_name.toLowerCase().includes(keyword) ||
      lead.contact_name.toLowerCase().includes(keyword) ||
      lead.email.toLowerCase().includes(keyword) ||
      lead.department.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Leads
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage incoming sales opportunities.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
          <input
            type="text"
            placeholder="Search company, contact, email..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Proposal Sent</option>
            <option>Client Reviewing</option>
            <option>Won</option>
            <option>Lost</option>
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            No leads found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {search || statusFilter !== "All"
              ? "Try a different search or filter."
              : "Add your first lead to get started."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <TableCell className="font-mono text-xs text-slate-500">
                    {lead.lead_number}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={lead.company_name} />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {lead.company_name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{lead.contact_name}</TableCell>
                  <TableCell className="text-slate-500">{lead.email}</TableCell>
                  <TableCell>{lead.department}</TableCell>
                  <TableCell className="text-slate-500">
                    {lead.source}
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatReceivedTime(lead.created_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/leads/${lead.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {lead.hasQuote ? (
                          <DropdownMenuItem asChild>
                            <Link href={`/crm/quotes/${lead.quoteId}`}>
                              View Quote
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <Link href={`/crm/quotes/new?leadId=${lead.id}`}>
                              Create Quote
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/clients/new?leadId=${lead.id}`}>
                            Convert To Client
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
