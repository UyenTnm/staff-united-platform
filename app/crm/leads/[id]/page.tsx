"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { getLead } from "@/lib/lead";
import { getQuoteByLeadId } from "@/lib/quotes";

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

export default function LeadDetailPage() {
  const params = useParams();

  const [lead, setLead] = useState<Lead | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLead() {
      const data = await getLead(params.id as string);
      setLead(data);

      const quote = await getQuoteByLeadId(params.id as string);

      if (quote) {
        setQuoteId(quote.id);
      }

      setLoading(false);
    }

    loadLead();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading lead...</div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div>Lead not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/crm">← Back to Leads</Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">{lead.company_name}</h1>

          <p className="text-slate-500 mt-2">{lead.department}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Contact Information</h2>

            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {lead.contact_name}
              </p>

              <p>
                <strong>Email:</strong> {lead.email}
              </p>

              <p>
                <strong>Phone:</strong> {lead.phone}
              </p>

              <p>
                <strong>Source:</strong> {lead.source}
              </p>
            </div>
          </div>

          {/* Overview */}
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Lead Overview</h2>

            <div className="space-y-3">
              <p>
                <strong>Lead #:</strong> {lead.lead_number}
              </p>

              <p>
                <strong>Department:</strong> {lead.department}
              </p>

              <p>
                <strong>Status:</strong> {lead.status}
              </p>

              <p>
                <strong>Priority:</strong> {lead.priority}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {quoteId ? (
            <Button asChild>
              <Link href={`/crm/quotes/${quoteId}`}>View Quote</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/crm/quotes/new?leadId=${lead.id}`}>
                Create Quote
              </Link>
            </Button>
          )}

          <Button variant="secondary">Convert To Client</Button>
        </div>
      </div>
    </AppLayout>
  );
}
