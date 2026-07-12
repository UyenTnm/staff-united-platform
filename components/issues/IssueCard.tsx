"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { IssueStatusBadge } from "./IssueStatusBadge";

interface IssueCardProps {
  id: string;

  title: string;

  employee: string;

  department: string;

  description: string;

  deduction: number;

  status: string;

  openUrl: string;
}

export function IssueCard({
  title,
  employee,
  department,
  description,
  deduction,
  status,
  openUrl,
}: IssueCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{title}</h2>

          <p className="text-slate-500 mt-1">
            {employee} • {department}
          </p>

          <p className="mt-4 text-slate-700">{description}</p>

          <div className="flex items-center gap-6 mt-5">
            <div>
              <p className="text-xs text-slate-500">Deduction</p>

              <p className="text-red-600 font-bold">-{deduction} Point</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Status</p>

              <IssueStatusBadge status={status} />
            </div>
          </div>
        </div>

        <Button asChild>
          <Link href={openUrl}>Open</Link>
        </Button>
      </div>
    </Card>
  );
}
