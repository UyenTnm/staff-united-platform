import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LeadDetailPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <Header />
      <main className="pt-20 px-4 md:px-6 pb-12 md:ml-70">
        <Button asChild variant="outline">
          <Link href="/crm" className="mb-10">
            ← Back to Leads
          </Link>
        </Button>
        <div className="w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold">ABC Construction</h1>

            <p className="text-slate-500 mt-2">Strategic Operations Lead</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Contact Information</h2>

              <div className="space-y-3">
                <p>
                  <strong>Name:</strong> John Smith
                </p>
                <p>
                  <strong>Email:</strong> john@abc.com
                </p>
                <p>
                  <strong>Phone:</strong> +61 412 345 678
                </p>
                <p>
                  <strong>Country:</strong> Australia
                </p>
                <p>
                  <strong>Website:</strong> abc.com.au
                </p>
              </div>
            </div>

            <div className="border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Lead Overview</h2>

              <div className="space-y-3">
                <p>
                  <strong>Department:</strong> Strategic Operations
                </p>
                <p>
                  <strong>Status:</strong> New
                </p>
                <p>
                  <strong>Priority:</strong> High
                </p>
                <p>
                  <strong>Created:</strong> 17 Jun 2026
                </p>
              </div>
            </div>
          </div>

          {/* SERVICES REQUEST */}
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Services Requested</h2>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                Administrative Support
              </span>

              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                SOP & Process Support
              </span>

              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                HR Administration
              </span>
            </div>
          </div>

          {/* Goals & Challenges */}
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Goals & Challenges</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Current Challenges</h3>

                <p className="text-slate-600 dark:text-slate-400">
                  Business processes are not documented and most day-to-day
                  administration is handled directly by the founder.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Desired Outcome</h3>

                <p className="text-slate-600 dark:text-slate-400">
                  Build documented processes, improve delegation, and free up
                  management time for growth activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
