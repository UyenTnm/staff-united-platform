"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  QuoteItem,
  getQuoteItems,
  createQuoteItem,
  deleteQuoteItem,
  getItemTotal,
} from "@/lib/crm/quote-items";

interface QuoteItemsEditorProps {
  quoteId: string;
  customerMarket?: "vietnam" | "international" | null;
  // Trạng thái Accept/Paid của quote — khóa hẳn form thêm/xóa dịch vụ
  // sau khi khách đã Accept, tránh cộng thêm tiền không xin phép.
  proposalStatus?: string;
}

export function QuoteItemsEditor({
  quoteId,
  customerMarket,
  proposalStatus,
}: QuoteItemsEditorProps) {
  const isLocked = proposalStatus === "accepted" || proposalStatus === "paid";

  const isVietnam = customerMarket === "vietnam";
  const currencySymbol = isVietnam ? "₫" : "$";
  const currencyLabel = isVietnam ? "VNĐ" : "USD";

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [isOptional, setIsOptional] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    const data = await getQuoteItems(quoteId);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, [quoteId]);

  async function handleAdd() {
    if (isLocked) return;

    if (!serviceName.trim() || !unitPrice) {
      toast.warning("Please enter a service name and price.");
      return;
    }

    setSaving(true);
    try {
      await createQuoteItem({
        quote_id: quoteId,
        service_name: serviceName.trim(),
        description: description.trim(),
        quantity: Number(quantity) || 1,
        unit_price: Number(unitPrice),
        is_optional: isOptional,
        sort_order: items.length,
        currency_code: isVietnam ? "VND" : "USD",
      });

      setServiceName("");
      setDescription("");
      setQuantity("1");
      setUnitPrice("");
      setIsOptional(true);
      await loadItems();
      toast.success("Service option added.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (isLocked) return;

    try {
      await deleteQuoteItem(id);
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item.");
    }
  }

  const mandatoryTotal = items
    .filter((i) => !i.is_optional)
    .reduce((sum, i) => sum + getItemTotal(i), 0);

  const optionalTotal = items
    .filter((i) => i.is_optional)
    .reduce((sum, i) => sum + getItemTotal(i), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add Service Options
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Currency: {currencyLabel} ({isVietnam ? "🇻🇳" : "🌍"})
        </span>
      </div>

      {isLocked ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            The client has already accepted this proposal — services are locked
            to keep pricing consistent with what they agreed to. To offer
            different services, please create a new quote for this client
            instead.
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-500">
          Add each service or package you&apos;re offering, one at a time.
          Prices below are in <strong>{currencyLabel}</strong>. Mark an item as{" "}
          <strong>Optional</strong> to let the client choose it themselves on
          the proposal page.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {items.length > 0 && (
            <div className="mb-4 space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.service_name}
                      </p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          item.is_optional
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.is_optional ? "Optional" : "Mandatory"}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} × {currencySymbol}
                      {Number(item.unit_price).toLocaleString()} ={" "}
                      <span className="font-semibold text-emerald-700">
                        {currencySymbol}
                        {getItemTotal(item).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  {!isLocked && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="space-y-1 border-t pt-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Mandatory total</span>
                  <span>
                    {currencySymbol}
                    {mandatoryTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Optional (if all selected)</span>
                  <span>
                    {currencySymbol}
                    {optionalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Service name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Website Digital Presence"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    How many units. Leave as 1 for a flat-price service.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Unit Price ({currencyLabel})
                  </label>
                  <input
                    type="number"
                    placeholder={isVietnam ? "e.g. 5000000" : "e.g. 5000"}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Price for ONE unit, in <strong>{currencyLabel}</strong>.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Description (optional)
                </label>
                <textarea
                  placeholder="e.g. bullet points of what's included"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                Optional — client can select/deselect this on the proposal
              </label>

              <Button
                onClick={handleAdd}
                disabled={saving}
                variant="outline"
                className="w-full cursor-pointer"
              >
                <Plus className="mr-1 h-4 w-4" />
                {saving ? "Adding..." : "Add Service Option"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
