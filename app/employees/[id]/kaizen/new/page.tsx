"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

export default function NewKaizenPage() {
  const params = useParams();

  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [businessBenefit, setBusinessBenefit] = useState("");

  const [points, setPoints] = useState("1");

  const [impact, setImpact] = useState<KaizenImpact | "">("");

  const [status, setStatus] = useState<KaizenStatus>("Submitted");

  async function handleSave() {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!impact) {
      alert("Please select an impact level.");
      return;
    }

    try {
      setSaving(true);
      console.log({
        review_id: null,
        employee_id: params.id,
        title,
        description,
        category,
        business_benefit: businessBenefit,
        impact,
        performance_points: parseInt(points, 10),
        status,
        approved_by: null,
        implemented_date: null,
        review_note: null,
        review_month: getReviewMonth(new Date()),
      });

      const kaizen = await createKaizen({
        review_id: null,
        employee_id: params.id as string,
        title,
        description,
        category,
        business_benefit: businessBenefit,
        impact,
        performance_points: parseInt(points, 10),
        status,
        approved_by: null,
        implemented_date: null,
        review_note: null,
        review_month: getReviewMonth(new Date()),
      });
      console.log("Created:", kaizen);

      router.push(`/employees/${params.id}/kaizen`);
    } catch (err) {
      //   console.error("Create Kaizen Error:", JSON.stringify(err, null, 2));
      console.error("Create Kaizen Error:", err);
      alert("Unable to save improvement.");
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
            <Link href={`/employees/${params.id}/kaizen`}>Cancel</Link>
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

          <div>
            <label className="text-sm font-medium">Impact Level</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={KAIZEN_IMPACTS}
                value={impact}
                onChange={setImpact}
                placeholder="Select Impact"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Performance Points</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={KAIZEN_POINTS}
                value={points}
                onChange={setPoints}
                placeholder="Select Points"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>

            <div className="mt-2">
              <IssueTypeSelect
                items={KAIZEN_STATUSES}
                value={status}
                onChange={setStatus}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Submit Improvement"}
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
