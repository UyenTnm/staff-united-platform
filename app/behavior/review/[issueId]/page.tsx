"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  getBehaviorReview,
  resolveBehaviorByHR,
  sendBehaviorToEmployee,
  sendBehaviorToManager,
  type BehaviorWithEmployee,
} from "@/lib/employees/behavior";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";

function BehaviorReviewPageContent() {
  const params = useParams();
  const router = useRouter();

  const [issue, setIssue] = useState<BehaviorWithEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [acceptAppealOpen, setAcceptAppealOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBehaviorReview(params.issueId as string);

        setIssue(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
        <div className="p-6">Behavior Issue not found.</div>
      </AppLayout>
    );
  }

  async function handleSendToEmployee() {
    if (!issue) return;

    try {
      setSending(true);

      await sendBehaviorToEmployee(issue.id, issue.employee_id);

      alert("Behavior issue has been sent to the employee.");

      const updatedIssue = await getBehaviorReview(issue.id);

      setIssue(updatedIssue);
    } catch (error) {
      console.error(error);
      alert("Unable to send issue.");
    } finally {
      setSending(false);
    }
  }

  async function handleSendToManager() {
    if (!issue) return;

    try {
      await sendBehaviorToManager(issue.id);

      setIssue({
        ...issue,
        status: "Waiting Manager",
      });

      toast.success("Behavior issue sent to Manager.");
    } catch (error) {
      console.error(error);

      toast.error("Unable to send issue.");
    }
  }

  async function handleAcceptAppeal() {
    if (!issue) return;

    try {
      await resolveBehaviorByHR(issue.id);
      const updatedIssue = await getBehaviorReview(issue.id);
      setIssue(updatedIssue);

      toast.success("Appeal accepted successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Unable to accept appeal.");
    } finally {
      setAcceptAppealOpen(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Behavior Review</h1>

            <p className="text-slate-500 mt-2">
              Review employee behavior issue before sending to employee.
            </p>
          </div>

          <Button variant="outline" onClick={() => router.back()}>
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
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-semibold mt-2">{issue.status}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Deduction</p>
              <p className="font-semibold mt-2 text-red-600">
                -{issue.deduction} Point
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Review Month</p>
              <p className="font-semibold mt-2">{issue.review_month}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">Description</p>

            <Card className="mt-3 p-4 bg-slate-50">{issue.description}</Card>
          </div>

          {issue.employee_comment && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">
                Employee Response
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-amber-800">
                {issue.employee_comment}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            {issue.status === "Returned to HR" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setAcceptAppealOpen(true)}
                >
                  Accept Appeal
                </Button>

                <Button onClick={handleSendToManager}>
                  Reject Appeal & Send to Manager
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <AlertDialog open={acceptAppealOpen} onOpenChange={setAcceptAppealOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this appeal?</AlertDialogTitle>
            <AlertDialogDescription>
              The deduction will be removed and this issue will be closed. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptAppeal}>
              Accept Appeal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

export default function BehaviorReviewPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <BehaviorReviewPageContent />
    </RoleGuard>
  );
}
