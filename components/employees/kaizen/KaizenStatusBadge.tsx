import { Badge } from "@/components/ui/badge";
import { KaizenStatus } from "@/lib/employees/kaizen";

interface Props {
  status: KaizenStatus;
}
// interface Props {
//   status:
//     | "Draft"
//     | "Submitted"
//     | "Under Review"
//     | "Approved"
//     | "Implemented"
//     | "Rewarded";
// }

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

    case "Waiting Manager Review":
      return (
        <Badge className="bg-orange-100 text-orange-700">Waiting Manager</Badge>
      );

    case "Approved":
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;

    case "In Progress":
      return (
        <Badge className="bg-indigo-100 text-indigo-700">In Progress</Badge>
      );

    case "Waiting Verification":
      return (
        <Badge className="bg-amber-100 text-amber-700">
          Waiting Verification
        </Badge>
      );

    case "Verified":
      return <Badge className="bg-cyan-100 text-cyan-700">Verified</Badge>;

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
