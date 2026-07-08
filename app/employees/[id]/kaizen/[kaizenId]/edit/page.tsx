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
  markKaizenRewarded,
  markKaizenUnderReview,
  sendKaizenToManager,
  startExecution,
  requestVerification,
  verifyKaizen,
  KaizenImpact,
  KaizenStatus,
  KaizenRecord,
  rewardKaizen,
} from "@/lib/employees/kaizen";

import {
  KAIZEN_CATEGORIES,
  KAIZEN_IMPACTS,
} from "@/lib/employees/kaizen-options";
import { toast } from "sonner";
import { KaizenTimeline } from "@/components/employees/kaizen/kaizen-timeline";
import { useAuth } from "@/components/auth/auth-provider";

export default function EditKaizenPage() {
  const params = useParams();

  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");

  const [kaizen, setKaizen] = useState<KaizenRecord | null>(null);

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [businessBenefit, setBusinessBenefit] = useState("");

  const [impact, setImpact] = useState<KaizenImpact | "">("");

  const [status, setStatus] = useState<KaizenStatus>("Submitted");
  const [reviewNote, setReviewNote] = useState("");

  const { employee } = useAuth();

  const isAdministrativeReview =
    employee?.user_role === "HR" || employee?.user_role === "Admin";

  const isManagerReview = employee?.user_role === "Manager";

  const POINT_MAP: Record<KaizenImpact, number> = {
    Small: 1,
    Medium: 2,
    Major: 3,
    Innovation: 4,
    "Outstanding Innovation": 5,
  };
  const canEditCategory =
    (isAdministrativeReview && status === "Under Review") ||
    (isManagerReview && status === "Waiting Manager Review");

  useEffect(() => {
    async function loadKaizen() {
      const kaizen = await getKaizen(params.kaizenId as string);

      console.log("Current Employee:", employee);
      console.log("Kaizen Employee:", kaizen?.employee_id);
      console.log("Status:", status);
      console.log("Is Owner:", employee?.id === kaizen?.employee_id);

      if (!kaizen) return;
      setKaizen(kaizen);
      setTitle(kaizen.title);
      setCategory(kaizen.category ?? "");
      setDescription(kaizen.description ?? "");
      setBusinessBenefit(kaizen.business_benefit ?? "");
      setImpact(kaizen.impact);
      setStatus(kaizen.status);
      setReviewNote(kaizen.review_note ?? "");

      setLoading(false);

      console.log("Kaizen:", kaizen);
    }

    loadKaizen();
  }, [params.kaizenId]);

  async function handleApprove() {
    if (!employee) {
      toast.error("Current user not found.");
      return;
    }

    if (!impact) {
      toast.warning("Please select an impact level.");
      return;
    }

    try {
      await approveKaizen(
        params.kaizenId as string,
        employee.id,
        impact,
        POINT_MAP[impact],
        reviewNote,
      );

      toast.success("Kaizen approved.");

      setStatus("Approved");

      router.replace("/kaizens/approved");
    } catch (error) {
      console.error(error);
      toast.error("Unable to approve Kaizen.");
    }
  }

  async function handleStartExecution() {
    try {
      await startExecution(params.kaizenId as string);

      toast.success("Execution started.");

      setStatus("In Progress");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to start execution.");
    }
  }

  async function handleStartReview() {
    if (!employee) {
      toast.error("Current user not found.");
      return;
    }

    try {
      await markKaizenUnderReview(params.kaizenId as string, employee.id);

      toast.success("Kaizen is now under review.");

      router.refresh();
      setStatus("Under Review");
    } catch (error) {
      console.error(error);
      toast.error("Unable to start review.");
    }
  }

  async function handleRequestVerification() {
    try {
      await requestVerification(params.kaizenId as string);

      toast.success("Verification requested.");

      setStatus("Waiting Verification");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to request verification.");
    }
  }

  async function handleVerify() {
    if (!employee) return;

    try {
      await verifyKaizen(params.kaizenId as string, employee.id);

      toast.success("Kaizen verified successfully.");

      setStatus("Verified");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to verify Kaizen.");
    }
  }

  async function handleRewarded() {
    if (!employee) {
      toast.error("Current user not found.");
      return;
    }

    try {
      setSaving(true);

      await rewardKaizen(params.kaizenId as string, employee.id);

      toast.success("Employee rewarded successfully.");

      setStatus("Rewarded");

      router.refresh();

      router.replace("/kaizens/rewarded");
    } catch (error) {
      console.error(error);

      toast.error("Unable to reward employee.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.warning("Please enter a title.");
      return;
    }

    if (!category) {
      toast.warning("Please select a category.");
      return;
    }

    if (!impact) {
      toast.warning("Please select an impact level.");
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
        // performance_points: parseInt(points, 10),
        status,
        approved_by: null,
        review_note: reviewNote,
        review_month: getReviewMonth(new Date()),
      });

      let payload = {};

      if (isManagerReview) {
        payload = {
          impact,
          category,
          review_note: reviewNote,
        };
      } else if (isAdministrativeReview) {
        payload = {
          category,
          review_note: reviewNote,
        };
      } else {
        payload = {
          title,
          description,
          category,
          business_benefit: businessBenefit,
        };
      }

      console.log("Update payload:", payload);

      await updateKaizen(params.kaizenId as string, payload);

      toast.success("Changes saved.");

      router.refresh();
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        console.log("message:", err.message);
      } else {
        console.log("Unknown error:", err);
      }

      toast.error("Unable to save improvement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendToManager() {
    if (!employee) {
      toast.error("Current user not found.");
      return;
    }

    try {
      await sendKaizenToManager(
        params.kaizenId as string,
        employee.id,
        reviewNote,
      );

      toast.success("Sent to Manager successfully.");

      router.replace("/kaizens/pending");
    } catch (error) {
      console.error(error);
      toast.error("Unable to send to manager.");
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
              readOnly={isAdministrativeReview || isManagerReview}
              className={`w-full border rounded-lg p-3 mt-2 ${
                isAdministrativeReview || isManagerReview
                  ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                  : ""
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter improvement title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              readOnly={isAdministrativeReview || isManagerReview}
              rows={5}
              className={`w-full border rounded-lg p-3 mt-2 ${
                isAdministrativeReview || isManagerReview
                  ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                  : ""
              }`}
              placeholder="Describe this improvement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>

            <div className="mt-2">
              {/* <IssueTypeSelect
                items={KAIZEN_CATEGORIES}
                value={category}
                onChange={setCategory}
                placeholder="Select Category"
                disabled={isAdministrativeReview || isManagerReview}
              /> */}
              <IssueTypeSelect
                items={KAIZEN_CATEGORIES}
                value={category}
                onChange={setCategory}
                placeholder="Select Category"
                disabled={!canEditCategory}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Business Benefit</label>

            <textarea
              readOnly={isAdministrativeReview || isManagerReview}
              rows={4}
              className={`w-full border rounded-lg p-3 mt-2 ${
                isAdministrativeReview || isManagerReview
                  ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                  : ""
              }`}
              placeholder="What value does this improvement bring?"
              value={businessBenefit}
              onChange={(e) => setBusinessBenefit(e.target.value)}
            />
          </div>

          <hr />
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Kaizen Progress</h2>

            <KaizenTimeline status={status} />
          </Card>

          <div className="pt-2">
            <h2 className="text-lg font-semibold">
              {isManagerReview ? "Manager Review" : "Administrative Review"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Administrative review before manager evaluation.
            </p>
          </div>

          {employee?.user_role === "Manager" && (
            <div>
              <label className="text-sm font-medium">Impact Level</label>

              <div className="mt-2">
                <IssueTypeSelect
                  items={KAIZEN_IMPACTS}
                  value={impact}
                  onChange={(value) => {
                    setImpact(value as KaizenImpact);
                  }}
                  placeholder="Select Impact"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Current Status</label>

            <div className="mt-2 rounded-lg border bg-slate-50 px-4 py-3">
              {status}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Reviewer Notes</label>

            <textarea
              readOnly={false}
              rows={4}
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Write your review..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          <Card className="p-6 bg-slate-50">
            <h3 className="text-lg font-semibold mb-6">Audit Trail</h3>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              {/* Administrative Review */}

              <div>
                <p className="text-slate-500">Reviewed By</p>

                <p className="font-medium">
                  {kaizen?.reviewer?.full_name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Reviewed At</p>

                <p className="font-medium">
                  {kaizen?.reviewed_at
                    ? new Date(kaizen.reviewed_at).toLocaleString()
                    : "-"}
                </p>
              </div>

              {/* Manager Approval */}

              <div>
                <p className="text-slate-500">Approved By</p>

                <p className="font-medium">
                  {kaizen?.approver?.full_name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Approved At</p>

                <p className="font-medium">
                  {kaizen?.approved_at
                    ? new Date(kaizen.approved_at).toLocaleString()
                    : "-"}
                </p>
              </div>

              {/* Verification */}

              <div>
                <p className="text-slate-500">Verified By</p>

                <p className="font-medium">
                  {kaizen?.verifier?.full_name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Verified At</p>

                <p className="font-medium">
                  {kaizen?.verified_at
                    ? new Date(kaizen.verified_at).toLocaleString()
                    : "-"}
                </p>
              </div>

              {/* Reward */}

              <div>
                <p className="text-slate-500">Rewarded By</p>

                <p className="font-medium">
                  {kaizen?.rewarder?.full_name ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Rewarded At</p>

                <p className="font-medium">
                  {kaizen?.rewarded_at
                    ? new Date(kaizen.rewarded_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          </Card>

          {status === "Implemented" && (
            <div>
              <label className="text-sm font-medium">Implemented Date</label>

              <input
                // readOnly={isAdministrativeReview}
                type="date"
                className="w-full border rounded-lg p-3 mt-2"
                // value={implementedDate}
                // onChange={(e) => setImplementedDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {status === "Submitted" && (
              <Button onClick={handleStartReview}>Start Review</Button>
            )}

            {status === "Under Review" && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Button onClick={handleSendToManager}>Send to Manager</Button>
              </>
            )}

            {status === "Approved" && employee?.id === kaizen?.employee_id && (
              <Button onClick={handleStartExecution}>Start Execution</Button>
            )}

            {status === "In Progress" &&
              employee?.id === kaizen?.employee_id && (
                <Button onClick={handleRequestVerification}>
                  Request Verification
                </Button>
              )}

            {status === "Waiting Manager Review" &&
              employee?.user_role === "Manager" && (
                <>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Review"}
                  </Button>

                  <Button onClick={handleApprove}>Approve Kaizen</Button>
                </>
              )}

            {status === "Waiting Verification" &&
              employee?.user_role === "Manager" && (
                <Button
                  onClick={handleVerify}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Verify Result
                </Button>
              )}

            {status === "Verified" && employee?.user_role === "Manager" && (
              <Button
                onClick={handleRewarded}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Reward Employee
              </Button>
            )}

            {status === "Rewarded" && <Button disabled>Completed</Button>}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
