interface VersionHistoryProps {
  currentVersion?: number;
}

export default function VersionHistory({
  currentVersion = 1,
}: VersionHistoryProps) {
  return (
    <div className="border rounded-xl p-6">
      <h2 className="font-semibold mb-4">Version History</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3 bg-green-50">
          <div>
            <p className="font-medium">Version {currentVersion}</p>

            <p className="text-xs text-slate-500">Current Version</p>
          </div>

          <span className="text-green-600 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
}
