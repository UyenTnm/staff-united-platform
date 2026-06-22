import { AppLayout } from "@/components/app-layout";
import { ReportsOverview } from "@/components/reports/reports-overview";

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>

          <p className="text-muted-foreground">
            Business performance and operational insights.
          </p>
        </div>

        <ReportsOverview />
      </div>
    </AppLayout>
  );
}
