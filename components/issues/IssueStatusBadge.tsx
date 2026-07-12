interface Props {
  status: string;
}

export function IssueStatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    "Waiting Employee": "bg-amber-100 text-amber-700",

    "Returned to HR": "bg-red-100 text-red-700",

    "Waiting Manager": "bg-blue-100 text-blue-700",

    "Resolved by HR": "bg-green-100 text-green-700",

    Approved: "bg-green-100 text-green-700",

    Locked: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
