import { AppLayout } from "@/components/app-layout";
import { AssignmentsTable } from "@/components/assignments/assignments-table";

export default function AssignmentsPage() {
  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Assignments</h1>

          <p className="text-muted-foreground">
            Manage staff assignments and client responsibilities.
          </p>
        </div>

        <AssignmentsTable />
      </div>
    </AppLayout>
  );
}
