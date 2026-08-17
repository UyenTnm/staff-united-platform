"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";
import { SERVICE_CATALOG } from "@/lib/service-catalog";

// Khách tự chọn dịch vụ muốn mua thêm — dùng lại đúng Catalog 5
// phòng ban của STAFF United, không cho gõ tay tự do (đảm bảo tên
// dịch vụ luôn khớp với hệ thống nội bộ).
interface PastRequest {
  id: string;
  lead_number: string;
  department: string;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  New: {
    label: "Received — awaiting review",
    color: "bg-amber-100 text-amber-700",
  },
  Contacted: { label: "Being reviewed", color: "bg-blue-100 text-blue-700" },
  Qualified: { label: "In progress", color: "bg-blue-100 text-blue-700" },
  "Proposal Sent": {
    label: "Proposal sent — check your email",
    color: "bg-purple-100 text-purple-700",
  },
  Won: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  Lost: { label: "Closed", color: "bg-slate-100 text-slate-500" },
};

export default function RequestServicesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [pastRequests, setPastRequests] = useState<PastRequest[]>([]);

  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function loadPastRequests(email: string) {
    const { data } = await supabase
      .from("leads")
      .select("id, lead_number, department, status, created_at")
      .eq("email", email)
      .eq("source", "Client Portal Request")
      .order("created_at", { ascending: false });

    if (data) setPastRequests(data as PastRequest[]);
  }

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/portal/login");
        return;
      }

      setUserEmail(session.user.email || "");
      if (session.user.email) {
        await loadPastRequests(session.user.email);
      }
      setChecking(false);
    }
    load();
  }, [router]);

  function toggleDept(name: string) {
    setSelectedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedDepts.size === 0) {
      setError("Please select at least one service.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch("/api/portal/request-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.access_token,
          selectedServices: Array.from(selectedDepts),
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setSubmitted(true);
      if (userEmail) await loadPastRequests(userEmail);
    } catch (err) {
      console.error(err);
      setError("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <PortalLayout userEmail={userEmail}>
        <p className="text-sm text-slate-500">Loading...</p>
      </PortalLayout>
    );
  }

  if (submitted) {
    return (
      <PortalLayout userEmail={userEmail}>
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h1 className="mt-4 text-lg font-bold text-emerald-800">
              Request submitted!
            </h1>
            <p className="mt-2 text-sm text-emerald-700">
              Your account manager will reach out to you shortly with a proposal
              for the services you selected.
            </p>
          </div>

          <PastRequestsList requests={pastRequests} />

          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedDepts(new Set());
              setNotes("");
            }}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Submit another request
          </button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout userEmail={userEmail}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Request Additional Services
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select the services you&apos;re interested in — your account manager
          will follow up with a proposal.
        </p>

        <div className="mt-6 space-y-3">
          {SERVICE_CATALOG.map((dept) => {
            const isSelected = selectedDepts.has(dept.name);
            return (
              <button
                key={dept.name}
                onClick={() => toggleDept(dept.name)}
                className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="font-medium text-slate-900">{dept.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dept.categories.map((c) => c.name).join(" · ")}
                  </p>
                </div>
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Anything specific you need? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Tell us more about what you're looking for..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 w-full cursor-pointer rounded-xl bg-emerald-600 p-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>

        <div className="mt-8">
          <PastRequestsList requests={pastRequests} />
        </div>
      </div>
    </PortalLayout>
  );
}

// Hiện lại lịch sử các lần khách đã yêu cầu — để khách luôn xem lại
// được, không chỉ 1 toast biến mất sau khi submit.
function PastRequestsList({ requests }: { requests: PastRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Your Previous Requests
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {requests.map((r) => {
          const statusInfo = STATUS_LABEL[r.status] || {
            label: r.status,
            color: "bg-slate-100 text-slate-600",
          };
          return (
            <div key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {r.department}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
