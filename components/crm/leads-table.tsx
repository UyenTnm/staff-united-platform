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
import { useEffect, useState } from "react";
import { getLeads } from "@/lib/leads";

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
      console.log("Leads:", data);
      setLeads(data);
      setLoading(false);
    }

    loadLeads();
  }, []);

  if (loading) {
    return <Card className="p-6">Loading leads...</Card>;
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
    <Card>
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Leads</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Manage incoming sales opportunities.
        </p>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search company, contact, email..."
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-3">
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Proposal Sent</option>
              <option>Won</option>
              <option>Lost</option>
            </select>
          </div>
        </div>
      </div>

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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.lead_number}</TableCell>

              <TableCell>{lead.company_name}</TableCell>

              <TableCell>{lead.contact_name}</TableCell>

              <TableCell>{lead.email}</TableCell>

              <TableCell>{lead.department}</TableCell>

              <TableCell>{lead.source}</TableCell>

              <TableCell>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </TableCell>

              <TableCell>
                {new Date(lead.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{formatReceivedTime(lead.created_at)}</TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/crm/leads/${lead.id}`}>View Details</Link>
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
    </Card>
  );
}
