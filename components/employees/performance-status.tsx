import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  reviewMonth: string;
  status: string;
  updatedAt: string;
  reviewedBy?: string;
}

export function PerformanceStatus({
  reviewMonth,
  status,
  updatedAt,
  reviewedBy,
}: Props) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-5">
        Performance Status
      </h2>

      <div className="grid md:grid-cols-4 gap-6">

        <div>
          <p className="text-sm text-slate-500">
            Review Month
          </p>

          <p className="font-semibold mt-1">
            {reviewMonth}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Status
          </p>

          <Badge className="mt-2">
            {status}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Last Updated
          </p>

          <p className="font-semibold mt-1">
            {updatedAt}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Reviewed By
          </p>

          <p className="font-semibold mt-1">
            {reviewedBy ?? "-"}
          </p>
        </div>

      </div>
    </Card>
  );
}