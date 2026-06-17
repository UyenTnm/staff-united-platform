import { EmployeesTable } from "@/components/employees/employees-table";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

const employees = [
  {
    id: 1,
    name: "Uyen Truong",
    email: "uyen@staffunitedgroup.com",
    role: "Web Administrator",
    department: "Operations",
    status: "Active",
  },
];

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto pt-20">
          {/* Page Header */}
          <div className="mb-8 w-full">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Employees
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage staff members and access permissions.
            </p>
          </div>

          <EmployeesTable />
        </div>
      </main>
    </div>
  );
}
