import { AppLayout } from "@/components/app-layout";
import { QuotesTable } from "@/components/crm/quotes-table";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function QuotesPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Sidebar />
        <Header />

        <main className="pt-20 px-4 md:px-6 pb-12">
          <div className="w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Quotes
              </h1>

              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage client quotations and proposals.
              </p>
            </div>
            <QuotesTable />
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
