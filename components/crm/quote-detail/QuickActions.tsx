import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <div className="border rounded-xl p-6">
      <h2 className="font-semibold mb-4">Quick Actions</h2>

      <div className="flex flex-col gap-3">
        <Button className="w-full">Create New Version</Button>

        <Button variant="outline" className="w-full">
          Send Quote
        </Button>

        <Button variant="outline" className="w-full">
          Download PDF
        </Button>

        <Button variant="outline" className="w-full">
          Email Client
        </Button>
      </div>
    </div>
  );
}
