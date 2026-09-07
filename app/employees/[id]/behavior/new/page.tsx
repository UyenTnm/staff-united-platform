"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { IssueTypeSelect } from "@/components/employees/issue-type-select";
import { BEHAVIOR_ISSUES } from "@/lib/employees/issue-types";
import { useState } from "react";
import {
  createBehaviorIssue,
  sendBehaviorToEmployee,
} from "@/lib/employees/behavior";
import { getReviewMonth } from "@/lib/employees/bonus";
import { SCORE_DEDUCTION_OPTIONS } from "@/lib/employees/deduction-options";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/role-guard";

function NewBehaviorIssuePageContent() {
  const params = useParams();

  const router = useRouter();

  const [issueType, setIssueType] = useState("");

  const [description, setDescription] = useState("");

  const [deduction, setDeduction] = useState("1");

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!issueType) {
      toast.warning("Please select an issue type.");
      return;
    }

    if (!description.trim()) {
      toast.warning("Please enter a description.");
      return;
    }

    try {
      console.log({
        employee_id: params.id,
        issue_type: issueType,
        description,
        deduction,
      });
      const issue = await createBehaviorIssue({
        employee_id: params.id as string,
        issue_type: issueType,
        description,
        deduction: parseInt(deduction, 10),
        evaluator_id: null,
        issue_date: new Date().toISOString(),
        review_month: getReviewMonth(new Date()),
      });

      await sendBehaviorToEmployee(issue.id, params.id as string);

      toast.success("Behavior issue sent to employee.");

      router.push(`/employees/${params.id}/behavior`);
    } catch (err) {
      console.error(err);
      toast.error("Unable to save issue.");
    }
  }

  return (
    <AppLayout>
      {/* <div className="space-y-6 max-w-3xl"> */}
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add Behavior Issue</h1>

            <p className="text-slate-500 mt-2">
              Record a behavior issue for this employee.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${params.id}/behavior`}>Cancel</Link>
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium">Issue Type</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={BEHAVIOR_ISSUES}
                value={issueType}
                onChange={setIssueType}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              rows={5}
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div>
              <label className="text-sm font-medium">Score Deduction</label>

              <div className="mt-2">
                <IssueTypeSelect
                  items={SCORE_DEDUCTION_OPTIONS}
                  value={deduction}
                  onChange={setDeduction}
                  placeholder="Select Deduction"
                />
              </div>
            </div>
          </div>

          {/* <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Issue"}
          </Button> */}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" asChild>
              <Link href={`/employees/${params.id}/quality`}>Cancel</Link>
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Sending..." : "Send to Employee"}
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}


export default function NewBehaviorIssuePage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <NewBehaviorIssuePageContent />
    </RoleGuard>
  );
}