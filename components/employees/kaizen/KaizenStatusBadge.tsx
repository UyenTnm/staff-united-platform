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
      return (
        <Badge className="bg-orange-100 text-orange-700">
          Waiting Manager Approval
        </Badge>
      );

    case "Approved":
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>;

    case "In Progress":
      return (
        <Badge className="bg-indigo-100 text-indigo-700">In Progress</Badge>
      );

    case "Verified":
      return <Badge className="bg-cyan-100 text-cyan-700">Verified</Badge>;

    case "Rewarded":
      return (
        <Badge className="bg-brand-100 text-brand-700">Rewarded</Badge>
      );

    default:
      return <Badge>{status}</Badge>;
  }
}
