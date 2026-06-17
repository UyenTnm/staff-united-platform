import { AssetInventory } from "@/components/AssetInventory/page";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
// import { AlertCircle } from "lucide-react";

// const employees = [
//   {
//     id: 1,
//     name: "Uyen Truong",
//     email: "uyen@staffunitedgroup.com",
//     role: "Web Administrator",
//     department: "Operations",
//     status: "Active",
//   },
// ];

export default function AssetsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12 transition-all duration-300">
        <div className="w-full pt-4">
          {/* Page Header */}
          <div className="mb-8 w-full">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Assets
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage company equipment and asset assignments.
            </p>
          </div>
          <AssetInventory />
        </div>
      </main>
    </div>
  );
}
