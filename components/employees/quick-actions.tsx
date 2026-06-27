import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  employeeId: string;
}

const actions = [
  {
    title: "Quality Review",
    description: "Review quality issues, deductions and work performance.",
    href: "quality",
    button: "Review",
  },
  {
    title: "Behavior Review",
    description: "Review attendance, professionalism and workplace behavior.",
    href: "behavior",
    button: "Review",
  },
  {
    title: "Kaizen",
    description: "Review improvement ideas and continuous contributions.",
    href: "kaizen",
    button: "Review",
  },
  {
    title: "Monthly Summary",
    description: "View the final monthly performance and bonus calculation.",
    href: "summary",
    button: "View Summary",
  },
];

export function QuickActions({ employeeId }: Props) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Card
            key={action.href}
            className="
    flex
    flex-col
    justify-between
    p-5
    border
    hover:border-blue-500
    hover:shadow-md
    transition-all
  "
          >
            <div>
              <h3 className="font-semibold text-lg">{action.title}</h3>

              <p className="text-sm text-slate-500 mt-3 leading-7">
                {action.description}
              </p>
            </div>

            <Button asChild className="w-full mt-6">
              <Link href={`/employees/${employeeId}/${action.href}`}>
                {action.button}
              </Link>
            </Button>
          </Card>
        ))}
      </div>
    </Card>
  );
}
