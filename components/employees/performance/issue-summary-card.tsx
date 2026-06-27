import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  value: string;
}

export function IssueSummaryCard({ title, value }: Props) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </Card>
  );
}
