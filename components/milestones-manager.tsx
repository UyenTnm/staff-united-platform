"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import {
  Milestone,
  getMilestones,
  toggleMilestone,
  calculateProgress,
  groupHierarchical,
  ensureMilestonesForQuote,
} from "@/lib/crm/milestones";
import { toast } from "sonner";

interface MilestonesManagerProps {
  quoteId: string;
}

// Milestone TỰ ĐỘNG sinh theo dịch vụ chi tiết đã chọn — 3 tầng:
// Department > Category > Service chi tiết. Sale CHỈ tích ✓. Tự
// động vá milestone còn thiếu cho Quote cũ ngay khi mở trang.
export function MilestonesManager({ quoteId }: MilestonesManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  async function loadMilestones() {
    // Tự vá — Quote cũ chưa từng có milestone (tạo trước khi có tính
    // năng này) sẽ được sinh bù ngay tại đây.
    await ensureMilestonesForQuote(quoteId);
    const data = await getMilestones(quoteId);
    setMilestones(data);
    setLoading(false);
  }

  useEffect(() => {
    loadMilestones();
  }, [quoteId]);

  async function handleToggle(id: string, current: boolean) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_completed: !current } : m)),
    );
    try {
      await toggleMilestone(id, !current);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update milestone.");
      await loadMilestones();
    }
  }

  function toggleExpand(key: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const progress = calculateProgress(milestones);
  const hierarchy = groupHierarchical(milestones);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Project Progress
        </h2>
        <span className="text-sm font-bold text-emerald-600">{progress}%</span>
      </div>

      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : hierarchy.length === 0 ? (
        <p className="text-sm text-slate-400">
          No milestones yet — add a Service in the Services tab first,
          milestones will appear here automatically.
        </p>
      ) : (
        <div className="space-y-5">
          {hierarchy.map((serviceGroup) => {
            const allServiceItems = serviceGroup.categories.flatMap(
              (c) => c.items,
            );
            const serviceProgress = calculateProgress(allServiceItems);

            return (
              <div key={serviceGroup.serviceName}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {serviceGroup.serviceName}
                  </p>
                  <span className="text-xs font-semibold text-emerald-600">
                    {serviceProgress}%
                  </span>
                </div>

                <div className="space-y-1 pl-2">
                  {serviceGroup.categories.map((catGroup) => {
                    const catKey = `${serviceGroup.serviceName}::${catGroup.category}`;
                    const catProgress = calculateProgress(catGroup.items);
                    const isExpanded = expandedCategories.has(catKey);
                    const hasCategory = Boolean(catGroup.category);

                    return (
                      <div key={catKey}>
                        {hasCategory ? (
                          <>
                            <button
                              onClick={() => toggleExpand(catKey)}
                              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {isExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                )}
                                {catGroup.category}
                              </span>
                              <span className="text-xs text-slate-400">
                                {catProgress}%
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="ml-5 space-y-0.5">
                                {catGroup.items.map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() =>
                                      handleToggle(m.id, m.is_completed)
                                    }
                                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                                  >
                                    {m.is_completed ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                                    ) : (
                                      <Circle className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                                    )}
                                    <span
                                      className={`text-sm ${
                                        m.is_completed
                                          ? "text-slate-400 line-through"
                                          : "text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      {m.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          // Không có Category (dùng bước chung mặc định)
                          // — hiện thẳng, không cần dropdown.
                          <div className="space-y-0.5">
                            {catGroup.items.map((m) => (
                              <button
                                key={m.id}
                                onClick={() =>
                                  handleToggle(m.id, m.is_completed)
                                }
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                {m.is_completed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                                )}
                                <span
                                  className={`text-sm ${
                                    m.is_completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {m.title}
                                </span>
                              </button>
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
}
