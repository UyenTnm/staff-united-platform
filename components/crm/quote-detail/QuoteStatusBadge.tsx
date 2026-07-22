// import { QuoteStatus } from "@/types/quote";

import { QuoteStatus } from "@/types/quote";

interface Props {
  status: QuoteStatus;
}

export default function QuoteStatusBadge({ status }: Props) {
  const styles = {
    Draft: "bg-gray-100 text-gray-700",

    Sent: "bg-blue-100 text-blue-700",

    Viewed: "bg-yellow-100 text-yellow-700",

    Accepted: "bg-green-100 text-green-700",

    Rejected: "bg-red-100 text-red-700",

    Expired: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
