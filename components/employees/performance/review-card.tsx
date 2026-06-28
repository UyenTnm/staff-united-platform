import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  score: number;
  maxScore: number;
  count: number;
  href: string;

  color?: string;
}

export function ReviewCard({
  title,
  score,
  maxScore,
  count,
  href,
  color = "text-slate-900",
}: Props) {
  return (
    <Card className="p-6">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className={`text-4xl font-bold mt-3 ${color}`}>
        {score} / {maxScore}
      </h2>

      <p className="text-sm text-slate-500 mt-2">
        {count} Issue{count !== 1 ? "s" : ""}
      </p>

      <Button asChild className="mt-6 w-full" variant="outline">
      <Link href={href} target="_blank">
          View Details
        </Link>
      </Button>
    </Card>
  );
}
