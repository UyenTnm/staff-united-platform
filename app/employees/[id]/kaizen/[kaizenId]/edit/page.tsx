"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { IssueTypeSelect } from "@/components/employees/issue-type-select";
import { useEffect, useState } from "react";
import { getReviewMonth } from "@/lib/employees/bonus";

import {
  getKaizen,
  updateKaizen,
  approveKaizen,
  markKaizenImplemented,
  markKaizenRewarded,
  KaizenImpact,
  KaizenStatus,
} from "@/lib/employees/kaizen";

import {
  KAIZEN_CATEGORIES,
  KAIZEN_IMPACTS,
  KAIZEN_POINTS,
  KAIZEN_STATUSES,
} from "@/lib/employees/kaizen-options";

export default function EditKaizenPage() {
  const params = useParams();

  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [businessBenefit, setBusinessBenefit] = useState("");

  const [points, setPoints] = useState("1");

  const [impact, setImpact] = useState<KaizenImpact | "">("");

  const [status, setStatus] = useState<KaizenStatus>("Submitted");
  const [reviewNote, setReviewNote] = useState("");

  const [implementedDate, setImplementedDate] = useState("");

  useEffect(() => {
    async function loadKaizen() {
      const kaizen = await getKaizen(params.kaizenId as string);

      if (!kaizen) return;

      setTitle(kaizen.title);
      setCategory(kaizen.category ?? "");
      setDescription(kaizen.description ?? "");
      setBusinessBenefit(kaizen.business_benefit ?? "");
      setImpact(kaizen.impact);
      setPoints(String(kaizen.performance_points));
      setStatus(kaizen.status);
      setReviewNote(kaizen.review_note ?? "");

      setImplementedDate(
        kaizen.implemented_date ? kaizen.implemented_date.split("T")[0] : "",
      );

      setLoading(false);
    }

    loadKaizen();
  }, [params.kaizenId]);

  async function handleApprove() {
    try {
      await approveKaizen(
        params.kaizenId as string,
        "SYSTEM",
        impact as KaizenImpact,
        parseInt(points, 10),
      );

      alert("Kaizen approved.");

      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleImplemented() {
    try {
      await markKaizenImplemented(params.kaizenId as string);

      alert("Marked as Implemented.");

      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRewarded() {
    try {
      await markKaizenRewarded(params.kaizenId as string);

      alert("Marked as Rewarded.");

      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

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

      await updateKaizen(params.kaizenId as string, {
        title,
        description,
        category,
        business_benefit: businessBenefit,
        impact,
        performance_points: parseInt(points, 10),
        status,
        review_note: reviewNote,
        implemented_date: implementedDate || null,
      });
      console.log("Updated");

      router.push(`/employees/${params.id}/kaizen`);
    } catch (err) {
      //   console.error("Create Kaizen Error:", JSON.stringify(err, null, 2));
      console.error("Create Kaizen Error:", err);
      alert("Unable to save improvement.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Improvement</h1>

            <p className="text-slate-500 mt-2">
              Update this improvement record.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${params.id}/kaizen`}>Cancel</Link>
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">Employee Submission</h2>

          <p className="text-sm text-slate-500">
            Information submitted by the employee.
          </p>
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

          <hr />

          <div className="pt-2">
            <h2 className="text-lg font-semibold">Manager Review</h2>

            <p className="text-sm text-slate-500 mt-1">
              Evaluation completed by HR or Manager.
            </p>
          </div>

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
                onChange={(value) => setStatus(value as KaizenStatus)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Manager Review Note</label>

            <textarea
              rows={4}
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Write your review..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          {status === "Implemented" && (
            <div>
              <label className="text-sm font-medium">Implemented Date</label>

              <input
                type="date"
                className="w-full border rounded-lg p-3 mt-2"
                value={implementedDate}
                onChange={(e) => setImplementedDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            {status === "Submitted" && (
              <Button onClick={handleApprove}>Approve Kaizen</Button>
            )}

            {status === "Approved" && (
              <Button onClick={handleImplemented}>Mark Implemented</Button>
            )}

            {status === "Implemented" && (
              <Button onClick={handleRewarded}>Reward Employee</Button>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
