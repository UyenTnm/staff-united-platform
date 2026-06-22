import { AppLayout } from "@/components/app-layout";
import { EmployeesTable } from "@/components/employees/employees-table";

export default function EmployeesPage() {
  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Employees
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage staff members and access permissions.
          </p>
        </div>

        <EmployeesTable />
      </div>
    </AppLayout>
  );
}
