"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";

interface DocRow {
  id: string;
  file_name: string;
  file_url: string;
  category: string;
  uploaded_at: string;
  quotes: {
    quote_number: string;
    title: string;
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  contract: "Contract",
  deliverable: "Deliverable",
  invoice: "Invoice",
  other: "Other",
};

export default function PortalDocumentsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocRow[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/portal/login");
        return;
      }

      setUserEmail(session.user.email || "");

      // RLS đã tự lọc đúng document thuộc Quote của khách này
      const { data } = await supabase
        .from("quote_documents")
        .select(
          "id, file_name, file_url, category, uploaded_at, quotes(quote_number, title)",
        )
        .order("uploaded_at", { ascending: false });

      if (data) setDocuments(data as unknown as DocRow[]);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <PortalLayout userEmail={userEmail}>
        <p className="text-sm text-slate-500">Loading...</p>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout userEmail={userEmail}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Contracts, deliverables, and invoices shared with you.
        </p>

        {documents.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            No documents shared yet.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <FileText className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {CATEGORY_LABEL[doc.category] || doc.category} —{" "}
                      {doc.quotes?.title || doc.quotes?.quote_number} —{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Download className="h-4 w-4 flex-shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
