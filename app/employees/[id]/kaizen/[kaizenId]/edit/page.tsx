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

  const { employee } = useAuth();

  const isAdministrativeReview =
    employee?.user_role === "HR" || employee?.user_role === "Admin";

  const isManagerReview = employee?.user_role === "Manager";
  const isOwner = employee?.id === kaizen?.employee_id;
  const canEditReviewNote =
    !isOwner &&
    (employee?.user_role === "HR" || employee?.user_role === "Manager");

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

      router.replace("/kaizens/approved");
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

    try {
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

      toast.success("Execution started.");

      setStatus("In Progress");

      router.replace("/performance/kaizen");
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

      const reviewer = employee.user_role === "Manager" ? "Manager" : "HR";

      await createNotification(
        kaizen!.employee_id,
        "Kaizen Under Review",
        `Your Kaizen is now being reviewed by ${reviewer}.`,
        "kaizen",
        `/employees/${kaizen!.employee_id}/kaizen/${params.kaizenId}/edit`,
      );

      toast.success("Kaizen is now under review.");

      router.refresh();
      setStatus("Under Review");
    } catch (error) {
      toast.error("Unable to start review.");
    }
  }

  // async function handleRequestVerification() {
  //   if (!kaizen) {
  //     toast.error("Kaizen not found.");
  //     return;
  //   }

  //   try {
  //     await requestVerification(params.kaizenId as string);

  //     // Notify all HR
  //     const { data: hrUsers } = await supabase
  //       .from("employees")
  //       .select("id")
  //       .eq("user_role", "HR");

  //     if (hrUsers) {
  //       for (const hr of hrUsers) {
  //         await createNotification(
  //           hr.id,
  //           "Verification Requested",
  //           `${employee?.full_name} has requested verification for "${kaizen.title}".`,
  //           "kaizen",
  //           `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
  //         );
  //       }
  //     }

  //     // Notify all Managers
  //     const { data: managers } = await supabase
  //       .from("employees")
  //       .select("id")
  //       .eq("user_role", "Manager");

  //     if (managers) {
  //       for (const manager of managers) {
  //         await createNotification(
  //           manager.id,
  //           "Verification Requested",
  //           `${employee?.full_name} has requested verification for "${kaizen.title}".`,
  //           "kaizen",
  //           `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
  //         );
  //       }
  //     }

  //     toast.success("Verification requested.");

  //     setStatus("Waiting Verification");

  //     router.replace("/performance/kaizen");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Unable to request verification.");
  //   }
  // }

  async function handleRequestVerification() {
    if (!kaizen) {
      toast.error("Kaizen not found.");
      return;
    }

    try {
      console.log("STEP 1 - Update status");

      await requestVerification(params.kaizenId as string);

      console.log("STEP 2 - Load HR");

      const { data: hrUsers, error: hrError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "HR");

      console.log("HR:", hrUsers);
      console.log("HR Error:", hrError);

      if (hrUsers) {
        for (const hr of hrUsers) {
          console.log("Notify HR:", hr.id);

          await createNotification(
            hr.id,
            "Verification Requested",
            `${employee?.full_name} has requested verification for "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      console.log("STEP 3 - Load Managers");

      const { data: managers, error: managerError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "Manager");

      console.log("Managers:", managers);
      console.log("Manager Error:", managerError);

      if (managers) {
        for (const manager of managers) {
          console.log("Notify Manager:", manager.id);

          await createNotification(
            manager.id,
            "Verification Requested",
            `${employee?.full_name} has requested verification for "${kaizen.title}".`,
            "kaizen",
            `/employees/${kaizen.employee_id}/kaizen/${kaizen.id}/edit`,
          );
        }
      }

      console.log("DONE");

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

      // router.refresh();
      // router.replace("/kaizens/rewarded");
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

      // await rewardKaizen(params.kaizenId as string, employee.id);
      const result = await rewardKaizen(params.kaizenId as string, employee.id);

      console.log("Reward result:", result);

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

      const { data: manager } = await supabase
        .from("employees")
        .select("id")
        .eq("user_role", "Manager")
        .maybeSingle();

      if (manager) {
        await createNotification(
          manager.id,
          "Kaizen Waiting Approval",
          `${kaizen?.title} is waiting for your approval.`,
          "kaizen",
          `/employees/${kaizen!.employee_id}/kaizen/${params.kaizenId}/edit`,
        );
      }

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

                {employee?.user_role === "HR" && (
                  <Button onClick={handleSendToManager}>Send to Manager</Button>
                )}

                {employee?.user_role === "Manager" && (
                  <Button onClick={handleApprove}>Approve Kaizen</Button>
                )}
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

            {/* {status === "Rewarded" && <Button disabled>Completed</Button>} */}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
