"use client";

import { Card } from "@/components/ui/card";

export function ReportsOverview() {
  const metrics = [
    {
      title: "Total Leads",
      value: "128",
    },
    {
      title: "Quotes Sent",
      value: "42",
    },
    {
      title: "Active Clients",
      value: "26",
    },
    {
      title: "Assignments",
      value: "31",
    },
    {
      title: "Monthly Revenue",
      value: "$54,000",
    },
    {
      title: "Staff Utilization",
      value: "82%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-6">
          <p className="text-sm text-muted-foreground">{metric.title}</p>

          <h2 className="text-3xl font-bold mt-3">{metric.value}</h2>
        </Card>
      ))}
    </div>
  );
}
