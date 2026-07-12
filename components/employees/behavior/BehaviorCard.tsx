import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { BehaviorWithEmployee } from "@/lib/employees/behavior";

type Props = {
  issue: BehaviorWithEmployee;

  action?: React.ReactNode;
};

export function BehaviorCard({ issue, action }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">{issue.issue_type}</h2>

            <p className="text-slate-500">
              {issue.employees.full_name}
              {" • "}
              {issue.employees.department}
            </p>
          </div>

          <p className="text-sm leading-6">{issue.description}</p>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-500">Deduction</p>

              <p className="font-semibold text-red-600">-{issue.deduction}</p>
            </div>

            <div>
              <p className="text-slate-500">Status</p>

              <p className="font-medium">{issue.status}</p>
            </div>

            <div>
              <p className="text-slate-500">Evaluator</p>

              <p className="font-medium">{issue.evaluator?.full_name ?? "-"}</p>
            </div>
          </div>
        </div>

        <div>{action}</div>
      </div>
    </Card>
  );
}
