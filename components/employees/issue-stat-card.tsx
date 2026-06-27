import { Card } from "@/components/ui/card";

interface IssueStatCardProps {
  title: string;
  value: string;
  color?: string;
}

export function IssueStatCard({
  title,
  value,
  color = "text-slate-900",
}: IssueStatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </Card>
  );
}
