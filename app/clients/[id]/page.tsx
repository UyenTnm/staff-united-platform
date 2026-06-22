import { AppLayout } from "@/components/app-layout";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ClientDetailPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/clients">← Back to Clients</Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">ABC Construction</h1>

          <p className="text-slate-500 mt-2">Strategic Operations Client</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Company Information</h2>

            <div className="space-y-3">
              <p>
                <strong>Company:</strong>
                ABC Construction
              </p>

              <p>
                <strong>Website:</strong>
                abc.com.au
              </p>

              <p>
                <strong>Country:</strong>
                Australia
              </p>

              <p>
                <strong>Industry:</strong>
                Construction
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Service Overview</h2>

            <div className="space-y-3">
              <p>
                <strong>Department:</strong>
                Strategic Operations
              </p>

              <p>
                <strong>Monthly Value:</strong>
                $2,500 AUD
              </p>

              <p>
                <strong>Status:</strong>
                Active
              </p>

              <p>
                <strong>Account Manager:</strong>
                Uyen Truong
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Services Purchased</h2>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              Administrative Support
            </span>

            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              SOP Development
            </span>

            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              HR Administration
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
