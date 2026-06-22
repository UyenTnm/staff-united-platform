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
}

// const leads = [
//   {
//     id: "L-001",
//     company: "ABC Construction",
//     contact: "John Smith",
//     department: "Strategic Operations",
//     status: "New",
//     priority: "High",
//     created: "17 Jun 2026",
//   },
//   {
//     id: "L-002",
//     company: "XYZ Logistics",
//     contact: "Sarah Lee",
//     department: "Focused Marketing",
//     status: "Contacted",
//     priority: "Medium",
//     created: "16 Jun 2026",
//   },
//   {
//     id: "L003",
//     company: "Global Transport",
//     contact: "David Brown",
//     department: "Focused Marketing",
//     status: "Quoted",
//     priority: "Low",
//     created: "16 August 2026",
//   },
// ];

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
  const [leads, setLeads] = useState<Lead[]>([]);
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
    return <Card className="p-6">Loading leads...</Card>;
  }
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
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
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
                    <DropdownMenuItem asChild>
                      <Link href={`/crm/quotes/new?leadId=${lead.id}`}>
                        Create Quote
                      </Link>
                    </DropdownMenuItem>
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
