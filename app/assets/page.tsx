import { AppLayout } from "@/components/app-layout";
import { AssetInventory } from "@/components/AssetInventory/page";

export default function AssetsPage() {
  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Assets
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage company equipment and asset assignments.
          </p>
        </div>

        <AssetInventory />
      </div>
    </AppLayout>
  );
}
