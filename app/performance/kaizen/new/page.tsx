"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { IssueTypeSelect } from "@/components/employees/issue-type-select";
import { useState } from "react";
import { getReviewMonth } from "@/lib/employees/bonus";

import {
  createKaizen,
  KaizenImpact,
  KaizenStatus,
} from "@/lib/employees/kaizen";
import {
  KAIZEN_CATEGORIES,
  KAIZEN_IMPACTS,
  KAIZEN_POINTS,
  KAIZEN_STATUSES,
} from "@/lib/employees/kaizen-options";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function NewKaizenPage() {
  const router = useRouter();

  const { employee } = useAuth();

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [businessBenefit, setBusinessBenefit] = useState("");

  const [points, setPoints] = useState("1");

  const [impact, setImpact] = useState<KaizenImpact | "">("");

  const [status, setStatus] = useState<KaizenStatus>("Submitted");

  const isManager =
    employee?.user_role === "HR" || employee?.user_role === "Manager";

  async function saveKaizen(submitStatus: KaizenStatus) {
    if (!employee) {
      toast.info("Unable to identify current employee.");
      return;
    }

    if (!title.trim()) {
      toast.warning("Please enter a title.");
      return;
    }

    if (!category) {
      toast.warning("Please select a category.");
      return;
    }

    if (isManager && !impact) {
      toast.warning("Please select an impact level.");
      return;
    }
    const finalImpact: KaizenImpact = isManager
      ? (impact as KaizenImpact)
      : "Small";

    try {
      setSaving(true);
      console.log({
        review_id: null,
        employee_id: employee!.id,
        title,
        description,
        category,
        business_benefit: businessBenefit,
        impact: isManager ? impact : "Small",

        performance_points: isManager ? parseInt(points, 10) : 0,

        status: isManager ? status : submitStatus,
        approved_by: null,
        implemented_date: null,
        review_note: null,
        review_month: getReviewMonth(new Date()),
      });

      const kaizen = await createKaizen({
        review_id: null,
        employee_id: employee!.id,
        title,
        description,
        category,
        business_benefit: businessBenefit,

        impact: finalImpact,

        performance_points: isManager ? parseInt(points, 10) : 0,

        status: isManager ? status : submitStatus,

        approved_by: null,
        implemented_date: null,
        review_note: null,
        review_month: getReviewMonth(new Date()),
      });
      console.log("Created:", kaizen);
      toast.success(
        submitStatus === "Draft"
          ? "Draft saved successfully."
          : "Kaizen submitted successfully.",
      );
      router.push("/performance/kaizen");
    } catch (err) {
      //   console.error("Create Kaizen Error:", JSON.stringify(err, null, 2));
      console.error("Create Kaizen Error:", err);
      toast.error("Unable to save improvement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Submit Improvement</h1>

            <p className="text-slate-500 mt-2">
              Record a continuous improvement for this employee.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/performance/kaizen">Cancel</Link>
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium">Improvement Title</label>

            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter improvement title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              rows={5}
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Describe this improvement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={KAIZEN_CATEGORIES}
                value={category}
                onChange={setCategory}
                placeholder="Select Category"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Business Benefit</label>

            <textarea
              rows={4}
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="What value does this improvement bring?"
              value={businessBenefit}
              onChange={(e) => setBusinessBenefit(e.target.value)}
            />
          </div>

          {isManager && (
            <>
              {/* Impact Level */}
              <div>
                <label className="text-sm font-medium">Impact Level</label>

                <div className="mt-2">
                  <IssueTypeSelect
                    items={KAIZEN_IMPACTS}
                    value={impact}
                    onChange={(value) => setImpact(value as KaizenImpact)}
                    placeholder="Select Impact"
                  />
                </div>
              </div>

              {/* Performance Point */}
              <div>
                <label className="text-sm font-medium">
                  Performance Points
                </label>

                <div className="mt-2">
                  <IssueTypeSelect
                    items={KAIZEN_POINTS}
                    value={points}
                    onChange={setPoints}
                    placeholder="Select Points"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium">Status</label>

                <div className="mt-2">
                  <IssueTypeSelect
                    items={KAIZEN_STATUSES}
                    value={status}
                    onChange={(value) => setStatus(value as KaizenStatus)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => saveKaizen("Draft")}
              disabled={saving}
            >
              Save Draft
            </Button>

            <Button onClick={() => saveKaizen("Submitted")} disabled={saving}>
              Submit Improvement
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
