import { AppLayout } from "@/components/app-layout";
import { ClientsTable } from "@/components/clients/clients-table";

export default function ClientsPage() {
  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Clients</h1>

          <p className="text-muted-foreground">
            Manage active clients and service relationships.
          </p>
        </div>

        <ClientsTable />
      </div>
    </AppLayout>
  );
}
