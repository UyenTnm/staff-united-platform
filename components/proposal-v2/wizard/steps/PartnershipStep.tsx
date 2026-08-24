"use client";

import { useEffect } from "react";
import { PartnershipPageData } from "../../types";

interface Props {
  data: PartnershipPageData;
  onChange: React.Dispatch<React.SetStateAction<PartnershipPageData>>;
}

export default function PartnershipStep({ data, onChange }: Props) {
  const update = <K extends keyof PartnershipPageData>(
    field: K,
    value: PartnershipPageData[K],
  ) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const total = data.individualPackages.reduce((sum, item) => {
    const value = Number(item.price.replace(/[^\d.-]/g, ""));

    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  const discountPercent = Math.min(
    100,
    Math.max(0, Number(data.discount.replace(/[^\d.-]/g, "")) || 0),
  );

  const discountAmount = total * (discountPercent / 100);

  const finalPrice = total - discountAmount;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  useEffect(() => {
    const totalPrice = formatPrice(total);
    const final = formatPrice(finalPrice);
    const save = formatPrice(discountAmount);

    if (
      data.totalPrice === totalPrice &&
      data.finalPrice === final &&
      data.savePrice === save
    ) {
      return;
    }

    onChange((prev) => ({
      ...prev,
      totalPrice,
      finalPrice: final,
      savePrice: save,
    }));
  }, [
    total,
    finalPrice,
    discountAmount,
    data.totalPrice,
    data.finalPrice,
    data.savePrice,
    onChange,
  ]);

  const updatePackage = (
    index: number,
    field: "title" | "price",
    value: string,
  ) => {
    onChange((prev) => {
      const packages = [...prev.individualPackages];

      packages[index] = {
        ...packages[index],
        [field]: value,
      };

      return {
        ...prev,
        individualPackages: packages,
      };
    });
  };

  const addPackage = () => {
    onChange((prev) => ({
      ...prev,
      individualPackages: [
        ...prev.individualPackages,
        {
          title: "",
          price: "",
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    onChange((prev) => ({
      ...prev,
      individualPackages: prev.individualPackages.filter((_, i) => i !== index),
    }));
  };

  const updatePaymentTerm = (index: number, value: string) => {
    onChange((prev) => {
      const paymentTerms = [...prev.paymentTerms];

      paymentTerms[index] = value;

      return {
        ...prev,
        paymentTerms,
      };
    });
  };

  const addPaymentTerm = () => {
    onChange((prev) => ({
      ...prev,
      paymentTerms: [...prev.paymentTerms, ""],
    }));
  };

  const removePaymentTerm = (index: number) => {
    onChange((prev) => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8 text-[#123B68]">
      {/* Package Name */}
      <div>
        <label className="mb-3 block text-lg font-semibold">Package Name</label>

        <input
          type="text"
          value={data.packageName}
          onChange={(e) => update("packageName", e.target.value)}
          placeholder="Strategic Partnership Package"
          className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 text-lg outline-none transition focus:border-[#4F8DC9]"
        />
      </div>

      {/* Individual Packages */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Individual Packages</h2>

            <p className="mt-1 text-sm text-[#7B8BA1]">
              Add the packages included in this partnership.
            </p>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-4 py-2 text-sm font-semibold text-[#1769AA]">
            {data.individualPackages.length} items
          </span>
        </div>

        <div className="space-y-3">
          {data.individualPackages.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#E1E7EF] bg-[#FAFCFF] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1769AA]">
                  Package {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    updatePackage(index, "title", e.target.value)
                  }
                  placeholder="Package title"
                  className="rounded-xl border border-[#D5DADF] bg-white px-4 py-3 outline-none focus:border-[#4F8DC9]"
                />

                <input
                  type="text"
                  value={item.price}
                  onChange={(e) =>
                    updatePackage(index, "price", e.target.value)
                  }
                  placeholder="Price"
                  className="rounded-xl border border-[#D5DADF] bg-white px-4 py-3 outline-none focus:border-[#4F8DC9]"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPackage}
          className="mt-4 w-full rounded-xl border border-dashed border-[#4F8DC9] bg-[#F8FBFF] py-3 font-semibold text-[#174A7E] transition hover:bg-[#EEF6FF]"
        >
          + Add Package
        </button>
      </div>

      {/* Pricing */}
      {/* Pricing */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Partnership Pricing</h2>

        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-2xl bg-[#F4F8FC] p-5">
            <p className="text-sm font-semibold text-[#7B8BA1]">
              Total Package Price
            </p>

            <p className="mt-1 text-2xl font-bold text-[#123B68]">
              {formatPrice(total)} {data.currency}
            </p>

            <p className="mt-1 text-xs text-[#7B8BA1]">
              Automatically calculated from individual packages.
            </p>
          </div>

          {/* Discount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Discount
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.discount}
                  onChange={(e) => {
                    const value = Math.min(
                      100,
                      Math.max(0, Number(e.target.value) || 0),
                    );

                    update("discount", String(value));
                  }}
                  placeholder="10"
                  className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 pr-10 outline-none focus:border-[#4F8DC9]"
                />

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7B8BA1]">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Currency
              </label>

              <select
                value={data.currency}
                onChange={(e) =>
                  update("currency", e.target.value as "VND" | "USD")
                }
                className="w-full rounded-2xl border border-[#D5DADF] bg-white px-5 py-4 outline-none focus:border-[#4F8DC9]"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="rounded-2xl border border-[#D5DADF] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7B8BA1]">Original Price</span>

              <span className="font-semibold text-[#123B68]">
                {formatPrice(total)} {data.currency}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[#7B8BA1]">
                Discount ({discountPercent}%)
              </span>

              <span className="font-semibold text-red-500">
                - {formatPrice(discountAmount)} {data.currency}
              </span>
            </div>

            <div className="my-4 border-t border-[#E5EAF0]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#123B68]">Final Price</span>

              <span className="text-2xl font-bold text-[#1769AA]">
                {formatPrice(finalPrice)} {data.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Terms</h2>

          <p className="mt-1 text-sm text-[#7B8BA1]">
            Define the payment conditions for this partnership.
          </p>
        </div>

        <div className="space-y-3">
          {data.paymentTerms.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF] font-semibold text-[#1769AA]">
                {index + 1}
              </div>

              <textarea
                value={item}
                onChange={(e) => updatePaymentTerm(index, e.target.value)}
                placeholder="Enter payment term..."
                rows={2}
                className="flex-1 resize-none rounded-xl border border-[#D5DADF] bg-white px-4 py-3 outline-none focus:border-[#4F8DC9]"
              />

              <button
                type="button"
                onClick={() => removePaymentTerm(index)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPaymentTerm}
          className="mt-4 w-full rounded-xl border border-dashed border-[#4F8DC9] bg-[#F8FBFF] py-3 font-semibold text-[#174A7E] transition hover:bg-[#EEF6FF]"
        >
          + Add Payment Term
        </button>
      </div>
    </div>
  );
}
