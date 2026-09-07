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
    <Card className="p-5 hover:border-slate-300 transition">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>

            <IssueStatusBadge status={status} />
          </div>

          <p className="text-sm text-slate-500 mt-1">
            {employee} • {department}
          </p>

          {description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 md:shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-400">Deduction</p>
            <p className="text-red-600 font-bold">-{deduction} pt</p>
          </div>

          <Button asChild size="sm">
            <Link href={openUrl}>Open</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
