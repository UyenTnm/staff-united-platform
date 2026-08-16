"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { createQuote } from "@/lib/crm/quotes";
import { getLead, updateLeadStatus, type Lead } from "@/lib/crm/lead";
import { toast } from "sonner";

// ĐÃ ĐƠN GIẢN HÓA — bỏ hẳn phần nhập Service Options ở đây (bị trùng
// với khối "Add Service Options" trên trang chi tiết quote). Trang
// này giờ chỉ hỏi thông tin cơ bản để tạo quote, rồi CHUYỂN THẲNG
// sang trang chi tiết — nơi duy nhất để thêm dịch vụ, upload PDF, tạo
// QR... tránh 2 nơi làm cùng 1 việc gây nhầm lẫn.
export default function CreateQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leadId = searchParams.get("leadId");
  const [lead, setLead] = useState<Lead | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [customerMarket, setCustomerMarket] = useState<
    "vietnam" | "international"
  >("vietnam");
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadLead() {
      if (!leadId) return;
      const data = await getLead(leadId);
      setLead(data);
    }
    loadLead();
  }, [leadId]);

  async function handleCreateQuote() {
    if (!leadId || !lead) {
      toast.warning("Lead ID not found.");
      return;
    }

    if (!title.trim()) {
      toast.warning("Please enter a proposal title.");
      return;
    }

    setSaving(true);
    try {
      const quote = await createQuote({
        lead_id: lead.id,
        company_name: lead.company_name,
        contact_name: lead.contact_name,
        department: lead.department,
        title: title.trim(),
        notes,
        customer_market: customerMarket,
        payment_type: paymentType,
        items: [], // Chưa có dịch vụ nào — sẽ thêm ở trang chi tiết
      });

      await updateLeadStatus(lead.id, "Preparing Proposal");

      toast.success("Quote created — now add your services.");

      // Chuyển thẳng vào trang chi tiết — nơi duy nhất để thêm Service
      // Options, upload PDF, tạo QR/link.
      router.push(`/crm/quotes/${quote.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create quote.");
    } finally {
      setSaving(false);
    }
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="p-6">Loading lead...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Quote</h1>
          <p className="text-slate-500">
            Start a new quote for this lead — you&apos;ll add services on the
            next screen.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Lead Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Company:</strong> {lead.company_name}
            </p>
            <p>
              <strong>Contact:</strong> {lead.contact_name}
            </p>
            <p>
              <strong>Department:</strong> {lead.department}
            </p>
          </div>
        </div>

        <div className="border rounded-xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium">Customer Market</label>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setCustomerMarket("vietnam")}
                className={`border rounded-lg px-4 py-2 cursor-pointer ${
                  customerMarket === "vietnam"
                    ? "border-black bg-black text-white"
                    : "border-slate-300"
                }`}
              >
                🇻🇳 Vietnam — VND
              </button>
              <button
                type="button"
                onClick={() => setCustomerMarket("international")}
                className={`border rounded-lg px-4 py-2 cursor-pointer ${
                  customerMarket === "international"
                    ? "border-black bg-black text-white"
                    : "border-slate-300"
                }`}
              >
                🌍 International — USD
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Terms</label>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`border rounded-lg px-4 py-2 cursor-pointer ${
                  paymentType === "full"
                    ? "border-black bg-black text-white"
                    : "border-slate-300"
                }`}
              >
                Full payment (100%)
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={`border rounded-lg px-4 py-2 cursor-pointer ${
                  paymentType === "deposit"
                    ? "border-black bg-black text-white"
                    : "border-slate-300"
                }`}
              >
                50% Deposit + 50% on Completion
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Proposal Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Strategic Operations Package"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Additional notes..."
            />
          </div>

          <Button onClick={handleCreateQuote} disabled={saving}>
            {saving ? "Creating..." : "Create Quote & Add Services →"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
