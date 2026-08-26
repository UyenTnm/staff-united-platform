"use client";

import { NextStepsPageData } from "../../types";

interface Props {
  data: NextStepsPageData;
  onChange: React.Dispatch<React.SetStateAction<NextStepsPageData>>;
}

export default function NextStepsStep({ data, onChange }: Props) {
  const update = <K extends keyof NextStepsPageData>(
    field: K,
    value: NextStepsPageData[K],
  ) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNextStep = (index: number, value: string) => {
    onChange((prev) => {
      const nextSteps = [...prev.nextSteps];

      nextSteps[index] = value;

      return {
        ...prev,
        nextSteps,
      };
    });
  };

  const addNextStep = () => {
    onChange((prev) => ({
      ...prev,
      nextSteps: [...prev.nextSteps, ""],
    }));
  };

  const removeNextStep = (index: number) => {
    onChange((prev) => ({
      ...prev,
      nextSteps: prev.nextSteps.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8 text-[#123B68]">
      {/* Prepared By */}
      <div>
        <label className="mb-3 block text-lg font-semibold">Prepared By</label>

        <input
          type="text"
          value={data.preparedBy}
          onChange={(e) => update("preparedBy", e.target.value)}
          placeholder="STAFF United"
          className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-lg outline-none transition focus:border-[#4F8DC9]"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-3 block text-lg font-semibold">
          Contact Email
        </label>

        <input
          type="email"
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="website@staffunitedgroup.com"
          className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-base outline-none transition focus:border-[#4F8DC9]"
        />
      </div>

      {/* Next Steps */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Next Steps</h2>

            <p className="mt-1 text-sm text-[#7B8BA1]">
              Add the actions the client should take to begin the partnership.
            </p>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-4 py-2 text-sm font-semibold text-[#1769AA]">
            {data.nextSteps.length} items
          </span>
        </div>

        <div className="space-y-3">
          {data.nextSteps.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF] font-semibold text-[#1769AA]">
                {index + 1}
              </div>

              <input
                type="text"
                value={item}
                onChange={(e) => updateNextStep(index, e.target.value)}
                placeholder="Enter next step..."
                className="flex-1 rounded-xl border border-[#D5DADF] bg-white px-4 py-3 outline-none transition focus:border-[#4F8DC9]"
              />

              <button
                type="button"
                onClick={() => removeNextStep(index)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addNextStep}
          className="mt-4 w-full rounded-xl border border-dashed border-[#4F8DC9] bg-[#F8FBFF] py-3 font-semibold text-[#174A7E] transition hover:bg-[#EEF6FF]"
        >
          + Add Next Step
        </button>
      </div>

      {/* Closing Message */}
      <div>
        <label className="mb-3 block text-lg font-semibold">
          Closing Message
        </label>

        <textarea
          value={data.closingMessage}
          onChange={(e) => update("closingMessage", e.target.value)}
          rows={6}
          placeholder="Write a closing message for the client..."
          className="w-full resize-none rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-base leading-7 outline-none transition focus:border-[#4F8DC9]"
        />

        <p className="mt-2 text-sm text-[#7B8BA1]">
          This message will appear at the bottom of the proposal.
        </p>
      </div>
    </div>
  );
}
