import { AppLayout } from "@/components/app-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">{children}</div>
    </AppLayout>
  );
}
