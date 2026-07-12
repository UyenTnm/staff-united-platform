"use client";

import { AppLayout } from "@/components/app-layout";
import { IssueStatusBadge } from "@/components/issues/IssueStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  QualityIssue,
  employeeAcceptQuality,
  employeeAppealQuality,
  getQualityIssue,
} from "@/lib/employees/quality";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyQualityDetailPage() {
  const params = useParams();

  const [issue, setIssue] = useState<QualityIssue | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getQualityIssue(params.issueId as string);

      setIssue(data);
      setComment(data.employee_comment ?? "");
      setLoading(false);
    }

    loadData();
  }, [params.issueId]);

  async function handleAccept() {
    if (!issue) return;

    try {
      setSubmitting(true);

      await employeeAcceptQuality(issue.id);

      const updatedIssue = await getQualityIssue(issue.id);

      setIssue(updatedIssue);

      toast.success("Your response has been submitted successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Unable to submit your response.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAppeal() {
    if (!issue) return;

    if (!comment.trim()) {
      toast.error("Please provide your reason before submitting an appeal.");

      return;
    }

    try {
      setSubmitting(true);

      await employeeAppealQuality(issue.id, comment);

      const updatedIssue = await getQualityIssue(issue.id);

      setIssue(updatedIssue);

      toast.success("Your appeal has been submitted.");
    } catch (error) {
      console.error(error);

      toast.error("Unable to submit your appeal.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout>
        <div>Quality issue not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quality Issue</h1>

          <p className="text-slate-500 mt-2">Review your quality issue.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-500">Issue Type</p>

            <h2 className="text-2xl font-bold">{issue.issue_type}</h2>
          </div>

          <div>
            <p className="text-sm text-slate-500">Description</p>

            <p className="mt-2">{issue.description}</p>
          </div>

          {issue.hr_note && (
            <Card className="mt-6 border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">HR Note</h3>

              <p className="mt-2 whitespace-pre-wrap">{issue.hr_note}</p>
            </Card>
          )}

          {issue.manager_note && (
            <Card className="mt-4 border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">Manager Note</h3>

              <p className="mt-2 whitespace-pre-wrap">{issue.manager_note}</p>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Deduction</p>

              <p className="text-red-600 text-2xl font-bold">
                -{issue.deduction} Point
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>

              <IssueStatusBadge status={issue.status} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Your Response</h2>

        <p className="text-slate-500 mt-2">
          If you disagree with this issue you may explain your reason below.
        </p>

        {issue.status === "Waiting Employee" && (
          <>
            <Textarea
              className="mt-6"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment..."
              disabled={issue.status !== "Waiting Employee"}
            />
          </>
        )}

        {issue.status === "Waiting Employee" ? (
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleAppeal}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Appeal"}
            </Button>

            <Button
              className="cursor-pointer"
              onClick={handleAccept}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Accept"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              Your response has been submitted.
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Your response is now under review.
            </p>

            {issue.employee_comment && (
              <Card className="mt-6 border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">Your Appeal</h3>

                <p className="mt-2 whitespace-pre-wrap">
                  {issue.employee_comment}
                </p>
              </Card>
            )}

            <p className="mt-2 text-sm text-slate-600">Current Status</p>

            <div className="mt-2">
              <IssueStatusBadge status={issue.status} />
            </div>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
