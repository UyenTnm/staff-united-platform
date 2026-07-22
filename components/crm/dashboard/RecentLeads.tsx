"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentLeads } from "@/lib/crm/leads";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  lead_number: string;
  company_name: string;
  contact_name: string;
  status: string;
  created_at: string;
}

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

export default function RecentLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getRecentLeads();
      setLeads(data);
    }

    load();
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Leads</h2>

        <Link
          href="/crm"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/crm/leads/${lead.id}`}
            className="block rounded-xl border p-4 transition hover:border-emerald-500 hover:bg-emerald-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{lead.company_name}</p>

                <p className="text-sm text-slate-500">{lead.contact_name}</p>
              </div>

              <Badge className={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{lead.lead_number}</span>

              <span>{formatReceivedTime(lead.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
