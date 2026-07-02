import { Badge } from "@/components/ui/badge";

interface Props {
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Approved"
    | "Implemented"
    | "Rewarded";
}

export function KaizenStatusBadge({ status }: Props) {
  switch (status) {
    case "Draft":
      return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;

    case "Submitted":
      return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;

    case "Under Review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
      );

    case "Approved":
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;

    case "Implemented":
      return (
        <Badge className="bg-purple-100 text-purple-700">Implemented</Badge>
      );

    case "Rewarded":
      return (
        <Badge className="bg-emerald-100 text-emerald-700">Rewarded</Badge>
      );

    default:
      return <Badge>{status}</Badge>;
  }
}
