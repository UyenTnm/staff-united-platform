"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { IssueTypeSelect } from "@/components/employees/issue-type-select";
import { QUALITY_ISSUES } from "@/lib/employees/issue-types";
// import { SCORE_DEDUCTION_OPTIONS } from "@/lib/employees/deduction-options";
import { useState } from "react";
import { createQualityIssue } from "@/lib/employees/quality";
import { getReviewMonth } from "@/lib/employees/bonus";
import { SCORE_DEDUCTION_OPTIONS } from "@/lib/employees/deduction-options";

export default function NewQualityIssuePage() {
  const params = useParams();

  const router = useRouter();

  const [issueType, setIssueType] = useState("");

  const [description, setDescription] = useState("");

  const [deduction, setDeduction] = useState("1");

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!issueType) {
      alert("Please select an issue type.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }

    try {
      console.log({
        employee_id: params.id,
        issue_type: issueType,
        description,
        deduction,
      });
      await createQualityIssue({
        employee_id: params.id as string,
        issue_type: issueType,
        description,
        deduction: parseInt(deduction, 10),
        evaluator_id: null,
        issue_date: new Date().toISOString(),
        review_month: getReviewMonth(new Date()),
      });

      router.push(`/employees/${params.id}/quality`);
    } catch (err) {
      console.error(err);
      alert("Unable to save issue.");
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add Quality Issue</h1>

            <p className="text-slate-500 mt-2">
              Record a quality issue for this employee.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${params.id}/quality`}>Cancel</Link>
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium">Issue Type</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={QUALITY_ISSUES}
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
              <label className="text-sm font-medium">Deduction</label>

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

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Issue"}
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
