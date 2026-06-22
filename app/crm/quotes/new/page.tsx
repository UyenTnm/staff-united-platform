"use client";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

export default function CreateQuotePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Quote</h1>

          <p className="text-slate-500">Create a proposal for this lead.</p>
        </div>

        <div className="border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Quote Title</label>

            <input
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Strategic Operations Package"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>

            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="2500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>

            <textarea className="w-full border rounded-lg p-2 mt-1" rows={5} />
          </div>

          <Button>Create Quote</Button>
        </div>
      </div>
    </AppLayout>
  );
}
