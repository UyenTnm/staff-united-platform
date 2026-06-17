import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
}
