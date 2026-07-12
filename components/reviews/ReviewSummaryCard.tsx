"use client";

import { Card } from "@/components/ui/card";

interface ReviewSummaryCardProps {
  title: string;

  value: number;

  description: string;
}

export function ReviewSummaryCard({
  title,
  value,
  description,
}: ReviewSummaryCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="mt-3 text-4xl font-bold">{value}</h2>

      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </Card>
  );
}
