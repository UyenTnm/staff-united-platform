"use client";

import { useRef } from "react";
import { ScopePageData } from "../../types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ScopePageData;
  onChange: (value: ScopePageData) => void;
}

export default function ScopeStep({ data, onChange }: Props) {
  console.log("SCOPE STEP:", {
    scopeImage: data.scopeImage,
    positionX: data.scopeImagePositionX,
    positionY: data.scopeImagePositionY,
    scale: data.scopeImageScale,
  });

  const update = <K extends keyof ScopePageData>(
    key: K,
    value: ScopePageData[K],
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const updateService = (
    index: number,
    key: "title" | "description" | "price",
    value: string,
  ) => {
    const services = [...data.services];

    services[index] = {
      ...services[index],
      [key]: value,
    };

    // Tự động cộng tất cả service prices
    const originalPrice = services.reduce((total, service) => {
      return total + parsePrice(service.price);
    }, 0);

    // Tính giá sau discount
    const discount = Number(data.discount) || 0;

    const totalPrice = originalPrice - originalPrice * (discount / 100);

    onChange({
      ...data,
      services,
      originalPrice: formatPrice(originalPrice),
      totalPrice: formatPrice(totalPrice),
    });
  };

  const addService = () => {
    update("services", [
      ...data.services,
      {
        title: "",
        description: "",
        price: "",
      },
    ]);
  };

  const removeService = (index: number) => {
    if (data.services.length <= 1) return;

    update(
      "services",
      data.services.filter((_, i) => i !== index),
    );
  };

  const parsePrice = (value: string) => {
    return Number(value.replace(/[^\d]/g, "")) || 0;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const handleOriginalPriceChange = (value: string) => {
    const originalPrice = parsePrice(value);
    const discount = Number(data.discount) || 0;

    const finalPrice = originalPrice - originalPrice * (discount / 100);

    onChange({
      ...data,
      originalPrice: formatPrice(originalPrice),
      totalPrice: formatPrice(finalPrice),
    });
  };

  const handleDiscountChange = (value: string) => {
    const discount = Math.min(100, Math.max(0, Number(value) || 0));

    const originalPrice = data.services.reduce((total, service) => {
      return total + parsePrice(service.price);
    }, 0);

    const totalPrice = originalPrice - originalPrice * (discount / 100);

    onChange({
      ...data,
      discount: String(discount),
      originalPrice: formatPrice(originalPrice),
      totalPrice: formatPrice(totalPrice),
    });
  };

  return (
    <div className="space-y-8 font-[Poppins]">
      {/* =========================
          PROJECT INFORMATION
      ========================== */}
      <section>
        <h2 className="text-lg font-semibold text-[#103663]">
          Scope of Services
        </h2>

        <p className="mt-1 text-sm text-[#4A596E]">
          Define the services included in this proposal.
        </p>

        <div className="mt-5">
          <Input
            label="Project Title"
            value={data.projectTitle}
            onChange={(value) => update("projectTitle", value)}
            placeholder="Strategic Growth Proposal"
          />
          <ScopeCoverUpload
            image={data.scopeImage}
            positionX={data.scopeImagePositionX ?? 0}
            positionY={data.scopeImagePositionY ?? 0}
            scale={data.scopeImageScale ?? 1}
            onImageChange={(url) =>
              onChange({
                ...data,
                scopeImage: url,
                scopeImagePositionX: 0,
                scopeImagePositionY: 0,
                scopeImageScale: 1,
              })
            }
            onPositionChange={(x, y) =>
              onChange({
                ...data,
                scopeImagePositionX: x,
                scopeImagePositionY: y,
              })
            }
            onScaleChange={(scale) => update("scopeImageScale", scale)}
          />
        </div>
      </section>

      {/* =========================
          SERVICES
      ========================== */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#103663]">Services</h2>

            <p className="mt-1 text-sm text-[#4A596E]">
              Add the services included in the project.
            </p>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-xs font-semibold text-[#103663]">
            {data.services.length}{" "}
            {data.services.length === 1 ? "service" : "services"}
          </span>
        </div>

        <div className="mt-5 space-y-5">
          {data.services.map((service, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#D5DADF] bg-[#F8FAFC] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#4F8DC9]">
                    Service {index + 1}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#103663]">
                    Service Details
                  </p>
                </div>

                {data.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  label="Service Title"
                  value={service.title}
                  onChange={(value) => updateService(index, "title", value)}
                  placeholder="Business Process Optimisation"
                />

                <TextArea
                  label="Description"
                  value={service.description}
                  onChange={(value) =>
                    updateService(index, "description", value)
                  }
                  placeholder="Workflow improvement & automation"
                />

                <Input
                  label="Price"
                  value={service.price}
                  onChange={(value) => updateService(index, "price", value)}
                  placeholder="8,000,000"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addService}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#4F8DC9] bg-[#F8FBFF] py-3 text-sm font-semibold text-[#103663] transition hover:bg-[#EEF6FF]"
        >
          <Plus size={18} />
          Add Service
        </button>
      </section>

      {/* =========================
          STRATEGIC PARTNERSHIP
      ========================== */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#103663]">
            Strategic Partnership Package
          </h2>

          <p className="mt-1 text-sm text-[#4A596E]">
            Define the package name, original price and client discount.
          </p>
        </div>

        <Input
          label="Package Name"
          value={data.packageName}
          onChange={(value) =>
            onChange({
              ...data,
              packageName: value,
            })
          }
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-[#103663]">
            Original Price
          </label>

          <div className="rounded-xl border border-[#D5DADF] bg-[#F4F7FB] px-4 py-3 font-semibold text-[#103663]">
            {data.originalPrice || "0"} {data.currency}
          </div>

          <p className="mt-1 text-xs text-[#718096]">
            Automatically calculated from service prices.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#103663]">
            Discount
          </label>

          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={data.discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5DADF] px-4 py-3 pr-12 outline-none transition focus:border-[#4F8DC9]"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-[#103663]">
              %
            </span>
          </div>
        </div>

        {/* Final Price — READ ONLY */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#103663]">
            Final Client Price
          </label>

          <div className="rounded-xl border border-[#D5DADF] bg-[#F4F7FB] px-4 py-3 font-semibold text-[#103663]">
            {data.totalPrice} {data.currency}
          </div>

          <p className="mt-1 text-xs text-[#718096]">
            Automatically calculated from Original Price and Discount.
          </p>
        </div>
      </section>

      {/* =========================
          PAYMENT TERM
      ========================== */}

      <section>
        <h2 className="text-lg font-semibold text-[#103663]">Payment Terms</h2>

        <p className="mt-1 text-sm text-[#4A596E]">
          Add the payment terms shown on the Scope page.
        </p>

        <div className="mt-4 space-y-3">
          {(data.paymentTerms ?? []).map((term, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={term}
                onChange={(e) => {
                  const next = [...(data.paymentTerms ?? [])];
                  next[index] = e.target.value;

                  update("paymentTerms", next);
                }}
                placeholder={`Payment term ${index + 1}`}
                className="w-full rounded-xl border border-[#D5DADF] px-4 py-3 outline-none transition focus:border-[#4F8DC9]"
              />

              <button
                type="button"
                onClick={() => {
                  const next = (data.paymentTerms ?? []).filter(
                    (_, i) => i !== index,
                  );

                  update("paymentTerms", next);
                }}
                className="rounded-xl border border-red-200 px-4 text-red-500 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              update("paymentTerms", [...(data.paymentTerms ?? []), ""])
            }
            className="w-full rounded-xl border-2 border-dashed border-[#4F8DC9] py-3 font-medium text-[#103663] hover:bg-[#F8FBFF]"
          >
            + Add Payment Term
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================
   INPUT
========================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#103663]">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#D5DADF] bg-white px-4 py-3 text-sm text-[#103663] outline-none transition placeholder:text-[#9AA8B8] focus:border-[#4F8DC9] focus:ring-2 focus:ring-[#4F8DC9]/10"
      />
    </div>
  );
}

/* =========================
   TEXT AREA
========================= */

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#103663]">
        {label}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-[#D5DADF] bg-white px-4 py-3 text-sm text-[#103663] outline-none transition placeholder:text-[#9AA8B8] focus:border-[#4F8DC9] focus:ring-2 focus:ring-[#4F8DC9]/10"
      />
    </div>
  );
}

function ScopeCoverUpload({
  image,
  positionX,
  positionY,
  scale,
  onImageChange,
  onPositionChange,
  onScaleChange,
}: {
  image?: string;
  positionX: number;
  positionY: number;
  scale: number;
  onImageChange: (url: string) => void;
  onPositionChange: (x: number, y: number) => void;
  onScaleChange: (scale: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragging = useRef(false);

  const startPointer = useRef({
    x: 0,
    y: 0,
  });

  const startPosition = useRef({
    x: 0,
    y: 0,
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    console.log("Scope image selected:", file.name);

    const url = URL.createObjectURL(file);

    // Set image.
    // Position + zoom will be reset by the parent
    // through the same state update.
    onImageChange(url);

    // Cho phép chọn lại cùng file
    e.target.value = "";
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;

    dragging.current = true;

    startPointer.current = {
      x: e.clientX,
      y: e.clientY,
    };

    startPosition.current = {
      x: positionX,
      y: positionY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const dx = e.clientX - startPointer.current.x;

    const dy = e.clientY - startPointer.current.y;

    onPositionChange(
      startPosition.current.x + dx,
      startPosition.current.y + dy,
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="mt-6">
      {/* TITLE */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[#103663]">
          Scope Cover Image
        </label>

        {image && (
          <span className="text-xs text-green-600">Image uploaded</span>
        )}
      </div>

      {/* =====================================
          UPLOAD INPUT
      ====================================== */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleUpload}
        className="hidden"
      />

      {/* ALWAYS VISIBLE UPLOAD BUTTON */}
      <button
        type="button"
        onClick={() => {
          console.log("Opening scope image picker");
          fileInputRef.current?.click();
        }}
        className="mb-3 w-full rounded-xl bg-[#103663] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#17497F]"
      >
        {image ? "Change Scope Image" : "Upload Scope Image"}
      </button>

      {/* =====================================
          IMAGE CANVAS
      ====================================== */}

      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-dashed border-[#4F8DC9] bg-[#F8FAFC] ${
          image ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {image ? (
          <img
            src={image}
            alt="Scope Cover"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
            style={{
              transform: `
                translate(
                  ${positionX}px,
                  ${positionY}px
                )
                scale(${scale})
              `,
              transformOrigin: "center center",
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-[#4A596E]">
            <p className="text-sm font-semibold">No Scope Image</p>

            <p className="mt-1 text-xs">Click "Upload Scope Image" above</p>
          </div>
        )}
      </div>

      {/* =====================================
          IMAGE CONTROLS
      ====================================== */}

      {image && (
        <div className="mt-5 space-y-5 rounded-xl border border-[#D5DADF] bg-white p-4">
          {/* ZOOM */}
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-[#103663]">Zoom</label>

              <span className="text-sm font-semibold text-[#4F8DC9]">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <input
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={scale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              className="w-full accent-[#103663]"
            />
          </div>

          {/* HORIZONTAL */}
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-[#103663]">
                Horizontal Position
              </label>

              <span className="text-sm font-semibold text-[#4F8DC9]">
                {Math.round(positionX)}
              </span>
            </div>

            <input
              type="range"
              min={-400}
              max={400}
              step={1}
              value={positionX}
              onChange={(e) =>
                onPositionChange(Number(e.target.value), positionY)
              }
              className="w-full accent-[#103663]"
            />
          </div>

          {/* VERTICAL */}
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-[#103663]">
                Vertical Position
              </label>

              <span className="text-sm font-semibold text-[#4F8DC9]">
                {Math.round(positionY)}
              </span>
            </div>

            <input
              type="range"
              min={-400}
              max={400}
              step={1}
              value={positionY}
              onChange={(e) =>
                onPositionChange(positionX, Number(e.target.value))
              }
              className="w-full accent-[#103663]"
            />
          </div>

          {/* INSTRUCTIONS */}
          <div className="rounded-lg bg-[#F4F8FC] px-3 py-2 text-xs text-[#4A596E]">
            <p>
              <strong>Drag:</strong> kéo ảnh trực tiếp
            </p>

            <p className="mt-1">
              <strong>Zoom:</strong> phóng to / thu nhỏ
            </p>

            <p className="mt-1">
              <strong>Position:</strong> chỉnh trái/phải và lên/xuống
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
