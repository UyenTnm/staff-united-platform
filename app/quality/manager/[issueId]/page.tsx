"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  approveQuality,
  QualityWithEmployee,
  getQualityReview,
} from "@/lib/employees/quality";
import { toast } from "sonner";

export default function ManagerQualityReviewPage() {
  const params = useParams();
  const router = useRouter();

  const [issue, setIssue] = useState<QualityWithEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getQualityReview(params.issueId as string);

      setIssue(data);

      setLoading(false);
    }

    loadData();
  }, [params.issueId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout>
        <div className="p-6">Quality Issue not found.</div>
      </AppLayout>
    );
  }

  async function handleApprove() {
    if (!issue) return;

    try {
      await approveQuality(issue.id);

      toast.success("Quality approved.");

      router.push("/quality?tab=manager");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to approve issue.");
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manager Approval</h1>

            <p className="text-slate-500 mt-2">
              Final manager review before approval.
            </p>
          </div>

          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Employee</p>

              <p className="font-semibold mt-2">{issue.employees.full_name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Department</p>

              <p className="font-semibold mt-2">{issue.employees.department}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Issue Type</p>

              <p className="font-semibold mt-2">{issue.issue_type}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Deduction</p>

              <p className="font-semibold mt-2 text-red-600">
                -{issue.deduction} Point
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">Description</p>

            <Card className="mt-3 p-4 bg-slate-50">{issue.description}</Card>
          </div>

          {issue.employee_comment && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-800">
                Employee Response
              </h3>

              <p className="mt-2 whitespace-pre-wrap">
                {issue.employee_comment}
              </p>
            </div>
          )}

          {issue.hr_note && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">HR Note</h3>

              <p className="mt-2 whitespace-pre-wrap">{issue.hr_note}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button className="cursor-pointer" onClick={handleApprove}>
              Approve
            </Button>{" "}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
