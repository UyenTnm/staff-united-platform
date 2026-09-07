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
  startExecution,
  requestVerification,
  updateKaizenProgress,
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
import { createNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

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

  const [progressNotes, setProgressNotes] = useState("");
  const [startingExecution, setStartingExecution] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const { employee } = useAuth();

  const isManagerReview = employee?.user_role === "Manager";
  const isOwner = employee?.id === kaizen?.employee_id;

  // Once Manager has acted on it (status is no longer "Submitted"), the
  // Kaizen is locked for the owner — view only from here on, per business
  // rule: "đã duyệt rồi thì không cho nhân viên chỉnh sửa, chỉ được xem".
  const canOwnerEdit = isOwner && status === "Submitted";

  const canEditReviewNote = isManagerReview && status === "Submitted";

  const POINT_MAP: Record<KaizenImpact, number> = {
    Small: 1,
    Medium: 2,
    Major: 3,
    Innovation: 4,
    "Outstanding Innovation": 5,
  };
  const canEditCategory = isManagerReview && status === "Submitted";

  useEffect(() => {
    async function loadKaizen() {
      const kaizen = await getKaizen(params.kaizenId as string);

      if (!kaizen) return;
      setKaizen(kaizen);
      setTitle(kaizen.title);
      setCategory(kaizen.category ?? "");
      setDescription(kaizen.description ?? "");
      setBusinessBenefit(kaizen.business_benefit ?? "");
      setImpact(kaizen.impact);
      setStatus(kaizen.status);
      setReviewNote(kaizen.review_note ?? "");
      setProgressNotes(kaizen.progress_notes ?? "");

      setLoading(false);
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

      await createNotification(
        kaizen!.employee_id,
        "Kaizen Approved",
        "Congratulations! Your Kaizen has been approved.",
        "kaizen",
        `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit`,
      );

      const { data: hrUsers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      if (hrUsers) {
        for (const hr of hrUsers) {
          await createNotification(
            hr.id,
            "Kaizen Approved",
            `${kaizen!.title} has been approved by ${employee.full_name}.`,
            "kaizen",
            `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit`,
          );
        }
      }

      toast.success("Kaizen approved.");

      setStatus("Approved");

      router.replace("/kaizens?tab=approved");
    } catch (error) {
      console.error(error);
      toast.error("Unable to approve Kaizen.");
    }
  }

  async function handleStartExecution() {
    if (!kaizen) {
      toast.error("Kaizen not found.");
      return;
    }
    if (startingExecution) return;

    try {
      setStartingExecution(true);
      await startExecution(params.kaizenId as string);

      // Notify all HR
      const { data: hrUsers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      if (hrUsers) {
        for (const hr of hrUsers) {
          await createNotification(
            hr.id,
            "Execution Started",
            `${employee?.full_name} started executing "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      // Notify all Managers
      const { data: managers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "Manager");

      if (managers) {
        for (const manager of managers) {
          await createNotification(
            manager.id,
            "Execution Started",
            `${employee?.full_name} started executing "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      toast.success("Execution started. You can now track progress below.");

      setStatus("In Progress");
      setKaizen({ ...kaizen, status: "In Progress" });
    } catch (error) {
      console.error(error);
      toast.error("Unable to start execution.");
    } finally {
      setStartingExecution(false);
    }
  }

  async function handleSaveProgress() {
    if (!kaizen) {
      toast.error("Kaizen not found.");
      return;
    }

    if (!progressNotes.trim()) {
      toast.warning("Please write a progress update first.");
      return;
    }

    try {
      setSavingProgress(true);

      await updateKaizenProgress(params.kaizenId as string, progressNotes);

      toast.success("Progress updated.");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to save progress.");
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleRequestVerification() {
    if (!kaizen) {
      toast.error("Kaizen not found.");
      return;
    }

    try {
      await requestVerification(params.kaizenId as string);

      const { data: hrUsers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      if (hrUsers) {
        for (const hr of hrUsers) {
          await createNotification(
            hr.id,
            "Verification Requested",
            `${employee?.full_name} has requested verification for "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      const { data: managers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "Manager");

      if (managers) {
        for (const manager of managers) {
          await createNotification(
            manager.id,
            "Verification Requested",
            `${employee?.full_name} has requested verification for "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      toast.success("Verification requested.");

      setStatus("Waiting Verification");

      router.replace("/performance/kaizen");
    } catch (error) {
      console.error("REQUEST VERIFY ERROR:", error);
      toast.error("Unable to request verification.");
    }
  }

  async function handleVerify() {
    if (!employee) return;

    try {
      await verifyKaizen(params.kaizenId as string, employee.id);

      await createNotification(
        kaizen!.employee_id,
        "Kaizen Verified",
        "Your Kaizen has been verified successfully.",
        "kaizen",
        `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit?from=verification`,
      );

      const { data: hrUsers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      if (hrUsers) {
        for (const hr of hrUsers) {
          await createNotification(
            hr.id,
            "Kaizen Verified",
            `${kaizen!.title} has been verified by ${employee?.full_name}.`,
            "kaizen",
            `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit?from=verification`,
          );
        }
      }

      toast.success("Kaizen verified successfully.");

      setStatus("Verified");

      router.replace(
        `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit?from=reward`,
      );
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

      await createNotification(
        kaizen!.employee_id,
        "Reward Received",
        "Congratulations! Your Kaizen has been rewarded.",
        "kaizen",
        `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit?from=reward`,
      );

      const { data: hrUsers } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      if (hrUsers) {
        for (const hr of hrUsers) {
          await createNotification(
            hr.id,
            "Reward Granted",
            `${kaizen!.title} has been rewarded.`,
            "kaizen",
            `/employees/${kaizen!.employee_id}/kaizen/${kaizen!.id}/edit?from=reward`,
          );
        }
      }

      toast.success("Employee rewarded successfully.");

      setStatus("Rewarded");

      router.refresh();

      router.replace("/kaizens?tab=rewarded");
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

      let payload = {};

      if (isManagerReview) {
        payload = {
          impact,
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

      await updateKaizen(params.kaizenId as string, payload);

      toast.success("Changes saved.");

      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Unable to save improvement.");
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
      <div className="w-full max-w-none space-y-6">
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
            {!canOwnerEdit && (
              <span className="block mt-1 text-amber-600">
                This Kaizen has already been processed and can no longer be
                edited — view only.
              </span>
            )}
          </p>
          <div>
            <label className="text-sm font-medium">Improvement Title</label>

            <input
              readOnly={!canOwnerEdit}
              className={`w-full border rounded-lg p-3 mt-2 ${
                !canOwnerEdit
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
              readOnly={!canOwnerEdit}
              rows={5}
              className={`w-full border rounded-lg p-3 mt-2 ${
                !canOwnerEdit
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
              readOnly={!canOwnerEdit}
              rows={4}
              className={`w-full border rounded-lg p-3 mt-2 ${
                !canOwnerEdit
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

          {(status === "In Progress" ||
            status === "Waiting Verification" ||
            status === "Verified" ||
            status === "Rewarded") && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Execution Progress</h2>

                {kaizen?.progress_updated_at && (
                  <p className="text-xs text-slate-400">
                    Last updated{" "}
                    {new Date(kaizen.progress_updated_at).toLocaleString()}
                  </p>
                )}
              </div>

              {isOwner && status === "In Progress" ? (
                <>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg p-3"
                    placeholder="What have you done so far? Any blockers? (this lets HR/Manager see progress before you request verification)"
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                  />

                  <Button
                    onClick={handleSaveProgress}
                    disabled={savingProgress}
                    variant="outline"
                    className="mt-3"
                  >
                    {savingProgress ? "Saving..." : "Save Progress Update"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {kaizen?.progress_notes || "No progress update posted yet."}
                </p>
              )}
            </Card>
          )}

          <div className="pt-2">
            <h2 className="text-lg font-semibold">Manager Review</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manager evaluates and approves the Kaizen directly.
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
              readOnly={!canEditReviewNote}
              rows={4}
              className={`w-full border rounded-lg p-3 mt-2 ${
                !canEditReviewNote
                  ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                  : ""
              }`}
              placeholder="Write your review..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          <Card className="p-6 bg-slate-50">
            <h3 className="text-lg font-semibold mb-6">Audit Trail</h3>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
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

          <div className="flex gap-3 flex-wrap">
            {status === "Submitted" && employee?.user_role === "Manager" && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Review"}
                </Button>

                <Button onClick={handleApprove}>Approve Kaizen</Button>
              </>
            )}

            {status === "Approved" && employee?.id === kaizen?.employee_id && (
              <Button
                onClick={handleStartExecution}
                disabled={startingExecution}
              >
                {startingExecution ? "Starting..." : "Start Execution"}
              </Button>
            )}

            {status === "In Progress" &&
              employee?.id === kaizen?.employee_id && (
                <Button onClick={handleRequestVerification}>
                  Request Verification
                </Button>
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
                className="bg-brand-600 hover:bg-brand-700"
              >
                Reward Employee
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
