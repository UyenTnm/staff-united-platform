"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Lock, ListPlus } from "lucide-react";
import { ServiceCatalogPicker } from "@/components/service-catalog-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { amountToWords } from "@/lib/number-to-words";

import {
  QuoteItem,
  getQuoteItems,
  createQuoteItem,
  deleteQuoteItem,
  getItemTotal,
  getItemFinalTotal,
  getItemDiscountAmount,
  updateQuoteItemDiscount,
} from "@/lib/crm/quote-items";

import { getQuote, updateQuotePricing } from "@/lib/crm/quotes";

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
  const [showCatalog, setShowCatalog] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Danh sách nhóm dịch vụ vừa chọn từ Catalog, đang chờ sale đặt giá
  // riêng cho từng nhóm trước khi thêm hàng loạt vào proposal.
  const [pendingGroups, setPendingGroups] = useState<
    {
      departmentName: string;
      description: string;
      unitPrice: string;
      quantity: string;
      isOptional: boolean;
    }[]
  >([]);
  const [addingAll, setAddingAll] = useState(false);

  async function loadItems() {
    const [data, quote] = await Promise.all([
      getQuoteItems(quoteId),
      getQuote(quoteId),
    ]);

    setItems(data);

    if (quote) {
      setDiscountEnabled(Boolean(quote.package_discount_enabled));
      setDiscountPercent(String(quote.package_discount_percent ?? 0));
    }

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

    // Cảnh báo nếu giá quá thấp bất thường — thường là dấu hiệu gõ
    // thiếu số 0 (VD: gõ 5000 thay vì 5000000). Ngưỡng: dưới
    // 100,000 VNĐ hoặc dưới $5 USD cho 1 dịch vụ.
    const priceNum = Number(unitPrice);
    const suspiciouslyLow = isVietnam ? priceNum < 100000 : priceNum < 5;
    if (suspiciouslyLow) {
      const confirmed = window.confirm(
        `This price (${amountToWords(priceNum, isVietnam)}) looks unusually low for a service. Did you mean to enter more zeros? Click OK to add anyway, or Cancel to fix it.`,
      );
      if (!confirmed) return;
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

  // Thêm hàng loạt các nhóm dịch vụ đã chọn từ Catalog vào proposal —
  // mỗi nhóm đã có giá riêng sale vừa nhập.
  async function handleAddAllPending() {
    if (isLocked) return;

    const invalidGroup = pendingGroups.find((g) => !g.unitPrice);
    if (invalidGroup) {
      toast.warning(
        `Please enter a price for "${invalidGroup.departmentName}".`,
      );
      return;
    }

    const lowPriceGroups = pendingGroups.filter((g) => {
      const p = Number(g.unitPrice);
      return isVietnam ? p < 100000 : p < 5;
    });
    if (lowPriceGroups.length > 0) {
      const names = lowPriceGroups.map((g) => g.departmentName).join(", ");
      const confirmed = window.confirm(
        `These prices look unusually low: ${names}. Did you mean to enter more zeros? Click OK to add anyway, or Cancel to fix it.`,
      );
      if (!confirmed) return;
    }

    setAddingAll(true);
    try {
      for (let i = 0; i < pendingGroups.length; i++) {
        const g = pendingGroups[i];
        await createQuoteItem({
          quote_id: quoteId,
          service_name: g.departmentName,
          description: g.description,
          quantity: Number(g.quantity) || 1,
          unit_price: Number(g.unitPrice),
          is_optional: g.isOptional,
          sort_order: items.length + i,
          currency_code: isVietnam ? "VND" : "USD",
        });
      }
      setPendingGroups([]);
      await loadItems();
      toast.success(`${pendingGroups.length} service(s) added.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add some services.");
    } finally {
      setAddingAll(false);
    }
  }

  function updatePendingGroup(
    index: number,
    field: "unitPrice" | "quantity" | "isOptional",
    value: string | boolean,
  ) {
    setPendingGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  function removePendingGroup(index: number) {
    setPendingGroups((prev) => prev.filter((_, i) => i !== index));
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
    .reduce((sum, i) => sum + getItemFinalTotal(i), 0);

  const optionalTotal = items
    .filter((i) => i.is_optional)
    .reduce((sum, i) => sum + getItemFinalTotal(i), 0);

  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("0");

  const [showPackageDiscountWarning, setShowPackageDiscountWarning] =
    useState(false);

  const hasServiceDiscount = items.some(
    (item) => item.discount_enabled && Number(item.discount_percent) > 0,
  );

  const subtotal = items.reduce(
    (sum, item) => sum + getItemFinalTotal(item),
    0,
  );

  const safeDiscountPercent = Math.min(
    Math.max(Number(discountPercent) || 0, 0),
    100,
  );

  const discountAmount = discountEnabled
    ? subtotal * (safeDiscountPercent / 100)
    : 0;

  const finalAmount = subtotal - discountAmount;

  async function savePackageDiscount(enabled: boolean, percent: number) {
    try {
      const safePercent = Math.min(Math.max(percent || 0, 0), 100);

      const amount = subtotal - (enabled ? subtotal * (safePercent / 100) : 0);

      await updateQuotePricing(quoteId, {
        amount,
        package_discount_enabled: enabled,
        package_discount_percent: safePercent,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save package discount.");
    }
  }

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
                      <details className="mt-0.5">
                        <summary className="cursor-pointer text-xs font-medium text-slate-500">
                          View included services
                        </summary>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-500">
                          {item.description}
                        </p>
                      </details>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} × {currencySymbol}
                      {Number(item.unit_price).toLocaleString()} ={" "}
                      <span className="font-semibold text-brand-700">
                        {currencySymbol}
                        {getItemTotal(item).toLocaleString()}
                      </span>
                    </p>

                    {item.discount_enabled && (
                      <div className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs">
                        <div className="flex justify-between text-brand-700">
                          <span>Discount ({item.discount_percent}%)</span>

                          <span>
                            -{currencySymbol}
                            {getItemDiscountAmount(item).toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-1 flex justify-between border-t border-brand-200 pt-1 font-semibold text-brand-800">
                          <span>Final price</span>

                          <span>
                            {currencySymbol}
                            {getItemFinalTotal(item).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isLocked && (
                      <div className="mt-2">
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                          <input
                            type="checkbox"
                            checked={item.discount_enabled}
                            onChange={async (e) => {
                              const enabled = e.target.checked;

                              try {
                                await updateQuoteItemDiscount(item.id, {
                                  discount_enabled: enabled,
                                  discount_percent: enabled
                                    ? Number(item.discount_percent) || 0
                                    : 0,
                                });

                                await loadItems();
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to update discount.");
                              }
                            }}
                            className="h-4 w-4 rounded accent-brand-600"
                          />
                          Apply Service Discount
                        </label>

                        {item.discount_enabled && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={item.discount_percent}
                              onChange={(e) => {
                                const percent = Math.min(
                                  Math.max(Number(e.target.value) || 0, 0),
                                  100,
                                );

                                setItems((prev) =>
                                  prev.map((current) =>
                                    current.id === item.id
                                      ? {
                                          ...current,
                                          discount_percent: percent,
                                        }
                                      : current,
                                  ),
                                );
                              }}
                              onBlur={async () => {
                                try {
                                  await updateQuoteItemDiscount(item.id, {
                                    discount_enabled: true,
                                    discount_percent:
                                      Number(item.discount_percent) || 0,
                                  });

                                  await loadItems();
                                } catch (error) {
                                  console.error(error);
                                  toast.error("Failed to save discount.");
                                }
                              }}
                              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            />

                            <span className="text-xs text-slate-500">
                              % discount
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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

                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={discountEnabled}
                      onChange={async (e) => {
                        const enabled = e.target.checked;

                        if (enabled && hasServiceDiscount) {
                          setShowPackageDiscountWarning(true);
                          return;
                        }

                        const percent = enabled ? safeDiscountPercent : 0;

                        setDiscountEnabled(enabled);
                        setDiscountPercent(String(percent));

                        await savePackageDiscount(enabled, percent);
                      }}
                      className="h-4 w-4 rounded accent-blue-600"
                      disabled={isLocked}
                    />
                    Apply Package Discount
                  </label>
                  {hasServiceDiscount && !discountEnabled && (
                    <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      ⚠️ One or more services already have an individual
                      discount. Package Discount is normally recommended when
                      offering multiple services as a bundle.
                    </p>
                  )}

                  {discountEnabled && (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Discount (%)
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discountPercent}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDiscountPercent(value);
                        }}
                        onBlur={async () => {
                          const percent = Math.min(
                            Math.max(Number(discountPercent) || 0, 0),
                            100,
                          );

                          setDiscountPercent(String(percent));

                          await savePackageDiscount(true, percent);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                        disabled={isLocked}
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-1 border-t border-blue-200 pt-3 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>
                        {currencySymbol}
                        {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {discountEnabled && safeDiscountPercent > 0 && (
                      <div className="flex justify-between text-brand-600">
                        <span>Package Discount ({safeDiscountPercent}%)</span>
                        <span>
                          -{currencySymbol}
                          {discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-t pt-2 text-base font-bold text-slate-900">
                      <span>Final Price</span>
                      <span>
                        {currencySymbol}
                        {finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {showPackageDiscountWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
                      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Package Discount
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 whitespace-nowrap">
                          Recommended when offering multiple services together.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowPackageDiscountWarning(false)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              setDiscountEnabled(true);
                              setShowPackageDiscountWarning(false);

                              await savePackageDiscount(
                                true,
                                safeDiscountPercent,
                              );
                            }}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
                          >
                            Apply Discount
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
              {pendingGroups.length > 0 && (
                <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
                  <p className="text-xs font-semibold uppercase text-brand-700">
                    Selected from Catalog — set price for each
                  </p>
                  {pendingGroups.map((g, index) => (
                    <div
                      key={g.departmentName}
                      className="rounded-lg border border-brand-200 bg-white p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {g.departmentName}
                        </p>
                        <button
                          onClick={() => removePendingGroup(index)}
                          className="cursor-pointer text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <details className="mb-2">
                        <summary className="cursor-pointer text-xs font-medium text-brand-700">
                          View included services
                        </summary>
                        <p className="mt-1 whitespace-pre-line text-xs text-slate-500">
                          {g.description}
                        </p>
                      </details>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={g.quantity}
                          onChange={(e) =>
                            updatePendingGroup(
                              index,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder={`Unit Price (${currencyLabel})`}
                          value={g.unitPrice}
                          onChange={(e) =>
                            updatePendingGroup(
                              index,
                              "unitPrice",
                              e.target.value,
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-sm"
                        />
                      </div>
                      {g.unitPrice && Number(g.unitPrice) > 0 && (
                        <p className="mt-1 text-xs italic text-brand-700">
                          = {amountToWords(Number(g.unitPrice), isVietnam)}
                        </p>
                      )}
                      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={g.isOptional}
                          onChange={(e) =>
                            updatePendingGroup(
                              index,
                              "isOptional",
                              e.target.checked,
                            )
                          }
                          className="h-3.5 w-3.5 rounded accent-brand-600"
                        />
                        Optional — client can select/deselect
                      </label>
                    </div>
                  ))}

                  <Button
                    onClick={handleAddAllPending}
                    disabled={addingAll}
                    className="w-full cursor-pointer"
                  >
                    {addingAll
                      ? "Adding..."
                      : `Add ${pendingGroups.length} Service(s) to Proposal`}
                  </Button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCatalog(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-300 bg-brand-50 p-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
              >
                <ListPlus className="h-4 w-4" />
                Choose from Service Catalog
              </button>

              <button
                type="button"
                onClick={() => setShowManualForm((v) => !v)}
                className="w-full cursor-pointer text-center text-xs text-slate-400 hover:text-slate-600"
              >
                {showManualForm
                  ? "− Hide manual entry"
                  : "+ Add a custom service manually"}
              </button>

              {showManualForm && (
                <>
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
                      {unitPrice && Number(unitPrice) > 0 && (
                        <p className="mt-1 text-xs italic text-brand-700">
                          = {amountToWords(Number(unitPrice), isVietnam)}
                        </p>
                      )}
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
                      className="h-4 w-4 rounded accent-brand-600"
                    />
                    Optional — client can select/deselect this on the proposal
                  </label>

                  <Button
                    onClick={handleAdd}
                    disabled={saving}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {saving ? "Adding..." : "Add Service Option"}
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {showCatalog && (
        <ServiceCatalogPicker
          onConfirm={(groups) => {
            setPendingGroups(
              groups.map((g) => ({
                departmentName: g.departmentName,
                description: g.description,
                unitPrice: "",
                quantity: "1",
                isOptional: true,
              })),
            );
            setShowCatalog(false);
          }}
          onClose={() => setShowCatalog(false)}
          existingServiceNames={items.map((i) => i.service_name)}
        />
      )}
    </div>
  );
}
