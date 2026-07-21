import { Button } from "@/components/ui/button";

export default function ContractCard() {
  return (
    <div className="border rounded-xl p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Contract</h2>

      <p className="text-sm text-slate-500 mb-6">
        No contract has been generated.
      </p>

      <Button disabled>Generate Contract</Button>
    </div>
  );
}
