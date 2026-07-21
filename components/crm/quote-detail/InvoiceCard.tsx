import { Button } from "@/components/ui/button";

export default function InvoiceCard() {
  return (
    <div className="border rounded-xl p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Invoice</h2>

      <p className="text-sm text-slate-500 mb-6">No invoice created.</p>

      <Button disabled>Create Invoice</Button>
    </div>
  );
}
