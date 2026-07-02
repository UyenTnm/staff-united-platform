import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

// import { formatDate } from "@/lib/date";

import type { KaizenRecord } from "@/lib/employees/kaizen";

import { KaizenStatusBadge } from "./KaizenStatusBadge";
import { formatDate } from "@/lib/utils";

interface Props {
  kaizen: KaizenRecord & {
    employees?: {
      id: string;
      full_name: string;
      department: string;
    };
  };

  action?: ReactNode;
}

export function KaizenCard({ kaizen, action }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-6">
        {/* Left */}
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-semibold">{kaizen.title}</h2>

          {kaizen.employees && (
            <p className="text-sm text-slate-500">
              {kaizen.employees.full_name} • {kaizen.employees.department}
            </p>
          )}

          {kaizen.category && (
            <p className="text-sm">
              <span className="font-medium">Category:</span> {kaizen.category}
            </p>
          )}

          {kaizen.description && (
            <p className="text-sm text-slate-700">{kaizen.description}</p>
          )}

          <p className="text-xs text-slate-400">
            Created {formatDate(kaizen.created_at)}
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-3">
          <KaizenStatusBadge status={kaizen.status} />

          {action}
        </div>
      </div>
    </Card>
  );
}
