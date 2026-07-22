import { AppLayout } from "@/components/app-layout";
import DashboardHeader from "@/components/crm/dashboard/DashboardHeader";
import ModuleCards from "@/components/crm/dashboard/ModuleCards";
import PipelineSummary from "@/components/crm/dashboard/PipelineSummary";
import QuickActions from "@/components/crm/dashboard/QuickActions";
import QuickStats from "@/components/crm/dashboard/QuickStats";
import RecentActivities from "@/components/crm/dashboard/RecentActivities";
import RecentLeads from "@/components/crm/dashboard/RecentLeads";
import RecentQuotes from "@/components/crm/dashboard/RecentQuotes";

export default function CRMDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <DashboardHeader />

        <QuickStats />

        <ModuleCards />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <RecentLeads />

            <RecentQuotes />
          </div>

          <div className="space-y-6">
            <QuickActions />

            <PipelineSummary />

            <RecentActivities />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
