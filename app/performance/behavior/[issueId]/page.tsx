"use client";

import { AppLayout } from "@/components/app-layout";
import { IssueStatusBadge } from "@/components/issues/IssueStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  BehaviorIssue,
  employeeAcceptBehavior,
  employeeAppealBehavior,
  getBehaviorIssue,
} from "@/lib/employees/behavior";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MyBehaviorDetailPage() {
  const params = useParams();

  const [issue, setIssue] = useState<BehaviorIssue | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getBehaviorIssue(params.issueId as string);

      setIssue(data);

      setLoading(false);
    }

    loadData();
  }, [params.issueId]);

  async function handleAccept() {
    if (!issue) return;

    try {
      setSubmitting(true);

      await employeeAcceptBehavior(issue.id);

      setIssue({
        ...issue,
        status: "Waiting Manager",
      });

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

      await employeeAppealBehavior(issue.id, comment);

      setIssue({
        ...issue,
        status: "Returned to HR",
        employee_comment: comment,
      });

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
        <div>Behavior issue not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Behavior Issue</h1>

          <p className="text-slate-500 mt-2">Review your behavior issue.</p>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Deduction</p>

              <p className="text-red-600 text-2xl font-bold">
                -{issue.deduction}
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

        <Textarea
          className="mt-6"
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
        />

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
