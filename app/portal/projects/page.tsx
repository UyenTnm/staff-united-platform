"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";
import {
  Milestone,
  calculateProgress,
  groupHierarchical,
} from "@/lib/crm/milestones";

interface QuoteWithMilestones {
  id: string;
  quote_number: string;
  title: string;
  status: string;
  milestones: Milestone[];
}

export default function PortalProjectsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<QuoteWithMilestones[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

      const { data: quotes } = await supabase
        .from("quotes")
        .select("id, quote_number, title, status, proposal_status")
        .in("proposal_status", ["deposit_paid", "paid"])
        .order("created_at", { ascending: false });

      if (quotes) {
        const withMilestones = await Promise.all(
          quotes.map(async (q) => {
            // LƯU Ý: không gọi ensureMilestonesForQuote() ở đây — khách
            // (role=client) chỉ có quyền XEM milestone, không được tạo
            // (RLS chặn INSERT). Việc sinh milestone chỉ diễn ra ở phía
            // Sale (MilestonesManager, khi mở tab Progress).
            const { data: milestones } = await supabase
              .from("project_milestones")
              .select("*")
              .eq("quote_id", q.id)
              .order("sort_order", { ascending: true });

            return {
              ...q,
              milestones: (milestones as Milestone[]) || [],
            };
          }),
        );
        setProjects(withMilestones);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Project Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track how your projects are coming along.
        </p>

        {projects.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            No active projects yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {projects.map((p) => {
              const progress = calculateProgress(p.milestones);
              const hierarchy = groupHierarchical(p.milestones);

              return (
                <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {p.title || p.quote_number}
                    </p>
                    <span className="text-sm font-bold text-emerald-600">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-2 mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {hierarchy.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No milestones added yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {hierarchy.map((serviceGroup) => {
                        const allItems = serviceGroup.categories.flatMap(
                          (c) => c.items,
                        );
                        const serviceProgress = calculateProgress(allItems);

                        return (
                          <div key={serviceGroup.serviceName}>
                            <div className="mb-1.5 flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-700">
                                {serviceGroup.serviceName}
                              </p>
                              <span className="text-xs text-slate-400">
                                {serviceProgress}%
                              </span>
                            </div>

                            <div className="space-y-1 pl-1">
                              {serviceGroup.categories.map((catGroup) => {
                                const catKey = `${p.id}::${serviceGroup.serviceName}::${catGroup.category}`;
                                const isOpen = expanded.has(catKey);
                                const hasCategory = Boolean(catGroup.category);

                                if (!hasCategory) {
                                  return (
                                    <div key={catKey} className="space-y-1">
                                      {catGroup.items.map((m) => (
                                        <div
                                          key={m.id}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          {m.is_completed ? (
                                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                          ) : (
                                            <Circle className="h-4 w-4 flex-shrink-0 text-slate-300" />
                                          )}
                                          <span
                                            className={
                                              m.is_completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-700"
                                            }
                                          >
                                            {m.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }

                                return (
                                  <div key={catKey}>
                                    <button
                                      onClick={() => toggleExpand(catKey)}
                                      className="flex w-full cursor-pointer items-center gap-1.5 text-left text-xs font-medium text-slate-600"
                                    >
                                      {isOpen ? (
                                        <ChevronDown className="h-3 w-3 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-slate-400" />
                                      )}
                                      {catGroup.category}
                                    </button>
                                    {isOpen && (
                                      <div className="ml-4 mt-1 space-y-1">
                                        {catGroup.items.map((m) => (
                                          <div
                                            key={m.id}
                                            className="flex items-center gap-2 text-sm"
                                          >
                                            {m.is_completed ? (
                                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                            ) : (
                                              <Circle className="h-4 w-4 flex-shrink-0 text-slate-300" />
                                            )}
                                            <span
                                              className={
                                                m.is_completed
                                                  ? "text-slate-400 line-through"
                                                  : "text-slate-700"
                                              }
                                            >
                                              {m.title}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
