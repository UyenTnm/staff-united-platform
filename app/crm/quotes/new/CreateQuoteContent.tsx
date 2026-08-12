"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { createQuote } from "@/lib/crm/quotes";
import { getLead, updateLeadStatus, type Lead } from "@/lib/crm/lead";
import { toast } from "sonner";

type QuoteItem = {
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  is_optional: boolean;
  sort_order: number;
};

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

  const [items, setItems] = useState<QuoteItem[]>([
    {
      service_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      is_optional: false,
      sort_order: 0,
    },
  ]);

  useEffect(() => {
    async function loadLead() {
      if (!leadId) return;

      const data = await getLead(leadId);
      setLead(data);
    }

    loadLead();
  }, [leadId]);

  const currency = customerMarket === "vietnam" ? "VND" : "USD";

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  function updateItem(
    index: number,
    field: keyof QuoteItem,
    value: string | number | boolean,
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        service_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        is_optional: false,
        sort_order: current.length,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function handleCreateQuote() {
    if (!leadId || !lead) {
      toast.warning("Lead ID not found.");
      return;
    }

    if (!title.trim()) {
      toast.warning("Please enter a proposal title.");
      return;
    }

    if (items.length === 0) {
      toast.warning("Please add at least one service.");
      return;
    }

    if (items.some((item) => !item.service_name.trim())) {
      toast.warning("Please enter a service name for every item.");
      return;
    }

    try {
      await createQuote({
        lead_id: lead.id,

        company_name: lead.company_name,
        contact_name: lead.contact_name,
        department: lead.department,

        title: title.trim(),
        notes,

        customer_market: customerMarket,

        items,
      });

      await updateLeadStatus(lead.id, "Proposal Sent");

      toast.success("Proposal created successfully!");

      router.push("/crm/quotes");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create proposal.");
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
          <h1 className="text-3xl font-bold">Create Proposal</h1>
          <p className="text-slate-500">Create a proposal for this lead.</p>
        </div>

        {/* Lead Information */}
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

        {/* Proposal Details */}
        <div className="border rounded-xl p-6 space-y-6">
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
                Vietnam — VND
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
                International — USD
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
        </div>

        {/* Services */}
        <div className="border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Services</h2>
              <p className="text-sm text-slate-500">
                Add the services included in this proposal.
              </p>
            </div>

            <span className="text-sm font-medium">Currency: {currency}</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="border rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Service {index + 1}</h3>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                value={item.service_name}
                onChange={(e) =>
                  updateItem(index, "service_name", e.target.value)
                }
                className="w-full border rounded-lg p-2"
                placeholder="Service name"
              />

              <textarea
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full border rounded-lg p-2"
                placeholder="Service description"
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    className="w-full border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Unit Price ({currency})
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, "unit_price", Number(e.target.value))
                    }
                    className="w-full border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Service Type</label>

                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={item.is_optional}
                      onChange={(e) =>
                        updateItem(index, "is_optional", e.target.checked)
                      }
                    />
                    Optional service
                  </label>
                </div>
              </div>
            </div>
          ))}

          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={addItem}
          >
            + Add Service
          </Button>

          <div className="border-t pt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-slate-500">Proposal Total</p>

              <p className="text-2xl font-bold">
                {total.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border rounded-xl p-6">
          <label className="text-sm font-medium">Notes</label>

          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Additional proposal notes..."
          />
        </div>

        <Button className="cursor-pointer" onClick={handleCreateQuote}>
          Create Proposal
        </Button>
      </div>
    </AppLayout>
  );
}
