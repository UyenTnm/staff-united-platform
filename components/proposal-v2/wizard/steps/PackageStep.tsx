"use client";

import { useState } from "react";
import { PricingPageData } from "../../types";

interface Props {
  data: PricingPageData;
  onChange: React.Dispatch<React.SetStateAction<PricingPageData>>;
  contentOverflow?: boolean;
}

export default function PackageStep({
  data,
  onChange,
  contentOverflow = false,
}: Props) {
  const update = <K extends keyof PricingPageData>(
    field: K,
    value: PricingPageData[K],
  ) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    onChange((prev) => {
      const deliverables = [...prev.deliverables];

      deliverables[index] = value;

      return {
        ...prev,
        deliverables,
      };
    });
  };

  const addDeliverable = () => {
    onChange((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, ""],
    }));
  };

  const removeDeliverable = (index: number) => {
    onChange((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8 text-[#123B68]">
      {contentOverflow && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-600">
            ⚠️ Page content is too long
          </p>

          <p className="mt-1 text-sm text-red-500">
            The content is overlapping the Timeline and Price area. Please
            shorten or remove some content before continuing.
          </p>
        </div>
      )}

      {/* Package Title */}
      <div>
        <label className="mb-3 block text-lg font-semibold">
          Package Title
        </label>

        <input
          type="text"
          value={data.packageTitle}
          onChange={(e) => update("packageTitle", e.target.value)}
          placeholder="Business Process Optimisation"
          className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-lg outline-none transition focus:border-[#4F8DC9]"
        />
      </div>

      {/* Strategic Objective */}
      <div>
        <label className="mb-3 block text-lg font-semibold">
          Strategic Objective
        </label>

        <textarea
          value={data.strategicObjective}
          onChange={(e) => update("strategicObjective", e.target.value)}
          placeholder="Describe the strategic objective..."
          rows={7}
          className="w-full resize-none rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-base leading-7 outline-none transition focus:border-[#4F8DC9]"
        />

        <p className="mt-2 text-sm text-[#7B8BA1]">
          Explain what this package is intended to achieve for the client.
        </p>
      </div>

      {/* Deliverables */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Key Deliverables</h2>

            {contentOverflow && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-600">
                  ⚠️ Page content is too long
                </p>

                <p className="mt-1 text-xs text-red-500">
                  Please shorten or remove some content before adding more.
                </p>
              </div>
            )}

            <p className="mt-1 text-sm text-[#7B8BA1]">
              Add the deliverables included in this package.
            </p>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-4 py-2 text-sm font-semibold text-[#1769AA]">
            {data.deliverables.length} items
          </span>
        </div>

        <div className="space-y-3">
          {data.deliverables.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF] font-semibold text-[#1769AA]">
                {index + 1}
              </div>

              <input
                type="text"
                value={item}
                onChange={(e) => updateDeliverable(index, e.target.value)}
                placeholder="Enter deliverable..."
                className="flex-1 rounded-xl border border-[#D5DADF] bg-white px-4 py-3 outline-none transition focus:border-[#4F8DC9]"
              />

              <button
                type="button"
                onClick={() => removeDeliverable(index)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDeliverable}
          disabled={contentOverflow}
          className={`mt-4 w-full rounded-xl border border-dashed py-3 font-semibold transition ${
            contentOverflow
              ? "cursor-not-allowed border-[#D5DADF] bg-[#F3F4F6] text-[#9AA5B1]"
              : "border-[#4F8DC9] bg-[#F8FBFF] text-[#174A7E] hover:bg-[#EEF6FF]"
          }`}
        >
          {contentOverflow
            ? "Page is full — remove content to add more"
            : "+ Add Deliverable"}
        </button>
      </div>

      {/* Timeline */}
      <div>
        <label className="mb-3 block text-lg font-semibold">Timeline</label>

        <input
          type="text"
          value={data.timeline}
          onChange={(e) => update("timeline", e.target.value)}
          placeholder="4–8 Weeks"
          className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-lg outline-none transition focus:border-[#4F8DC9]"
        />
      </div>

      {/* Price */}
      <div>
        <label className="mb-3 block text-lg font-semibold">Price</label>

        <div className="flex gap-3">
          <input
            type="text"
            value={data.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="18,000,000"
            className="flex-1 rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-lg outline-none transition focus:border-[#4F8DC9]"
          />

          <select
            value={data.currency}
            onChange={(e) =>
              update("currency", e.target.value as "VND" | "USD")
            }
            className="w-32 rounded-2xl border border-[#D5DADF] bg-white px-4 py-4 text-lg outline-none"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
    </div>
  );
}
