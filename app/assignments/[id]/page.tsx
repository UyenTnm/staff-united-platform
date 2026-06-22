import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

export default function AssignmentDetailPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/assignments">← Back to Assignments</Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">ABC Construction</h1>

          <p className="text-slate-500 mt-2">Strategic Operations Assignment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Client Information</h2>

            <div className="space-y-3">
              <p>
                <strong>Client:</strong>
                ABC Construction
              </p>

              <p>
                <strong>Department:</strong>
                Strategic Operations
              </p>

              <p>
                <strong>Service Plan:</strong>
                Monthly Retainer
              </p>

              <p>
                <strong>Value:</strong>
                $2,500 AUD
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Staff Assignment</h2>

            <div className="space-y-3">
              <p>
                <strong>Assigned Staff:</strong>
                Uyen Truong
              </p>

              <p>
                <strong>Role:</strong>
                Web Administrator
              </p>

              <p>
                <strong>Hours:</strong>
                20 hrs/week
              </p>

              <p>
                <strong>Status:</strong>
                Active
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Responsibilities</h2>

          <ul className="list-disc ml-5 space-y-2">
            <li>Website updates</li>
            <li>Client communications</li>
            <li>CRM administration</li>
            <li>Monthly reporting</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
