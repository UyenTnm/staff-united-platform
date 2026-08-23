"use client";

import { CoverFormData } from "../../types";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  data: CoverFormData;
  onChange: (value: CoverFormData) => void;
}

export default function CoverStep({ data, onChange }: Props) {
  const update = (key: keyof CoverFormData, value: any) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const updateDetail = (index: number, value: string) => {
    const next = [...data.proposalDetails];
    next[index] = value;

    update("proposalDetails", next);
  };

  return (
    <div className="space-y-8 font-[Poppins]">
      <section>
        <h2 className="text-lg font-semibold text-[#103663]">
          Client Information
        </h2>

        <div className="mt-4 space-y-4">
          <Input
            label="Client Name"
            value={data.preparedFor}
            onChange={(v) => update("preparedFor", v)}
          />

          <Input
            label="Prepared By"
            value={data.preparedBy}
            onChange={(v) => update("preparedBy", v)}
          />

          <Input
            label="Date"
            value={data.date}
            onChange={(v) => update("date", v)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#103663]">Proposal Title</h2>

        <div className="mt-4">
          <Input
            label="Main Title"
            value={data.proposalTitle}
            onChange={(v) => update("proposalTitle", v)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#103663]">
          Scope Highlights
        </h2>

        <p className="mt-1 text-sm text-[#4A596E]">
          Maximum 5 lines on the cover page.
        </p>

        <div className="mt-4 space-y-3">
          {data.proposalDetails.map((item, i) => (
            <Input
              key={i}
              label={`Line ${i + 1}`}
              value={item}
              onChange={(v) => updateDetail(i, v)}
            />
          ))}
        </div>
      </section>

      {/* ---------- BRAND ASSETS ---------- */}
      {/* Brand Assets */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#103663]">Brand Assets</h2>

        <UploadImage
          title="Partner Logo"
          image={data.clientLogo}
          onChange={(url) => update("clientLogo", url)}
        />

        <UploadImage
          title="Cover Image"
          image={data.coverImage}
          onChange={(url) => update("coverImage", url)}
        />

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span>Horizontal Position</span>
              <span>{data.coverPositionX ?? 0}</span>
            </div>

            <input
              type="range"
              min={-50}
              max={50}
              value={data.coverPositionX ?? 0}
              onChange={(e) => update("coverPositionX", Number(e.target.value))}
              className="w-full accent-[#103663]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Vertical Position</span>
              <span>{data.coverPositionY ?? 0}</span>
            </div>

            <input
              type="range"
              min={-80}
              max={80}
              value={data.coverPositionY ?? 0}
              onChange={(e) => update("coverPositionY", Number(e.target.value))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#103663]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#D5DADF] px-4 py-3 outline-none transition focus:border-[#4F8DC9]"
      />
    </div>
  );
}

function UploadBox({
  title,
  image,
  onUpload,
}: {
  title: string;
  image?: string;
  onUpload: (url: string) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <div className="rounded-2xl border-2 border-dashed border-[#D5DADF] bg-[#F8FBFF] p-4 transition hover:border-[#4F8DC9]">
        <div className="aspect-square overflow-hidden rounded-xl bg-white flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={title}
              width={180}
              height={180}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-[#4A596E]">
              <Upload className="mx-auto mb-2" size={28} />
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs opacity-70">Click to upload</p>
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

function UploadImage({
  title,
  image,
  onChange,
}: {
  title: string;
  image?: string;
  onChange: (url: string) => void;
}) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onChange(url);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#103663]">{title}</p>

      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

        <div className="overflow-hidden rounded-xl border-2 border-dashed border-[#D5DADF] bg-[#F8FAFC] transition hover:border-[#4F8DC9]">
          <div className="flex aspect-[4/3] items-center justify-center">
            {image ? (
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="text-center text-[#4A596E]">
                <Upload size={28} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Upload Image</p>
                <p className="text-xs opacity-70">PNG, JPG or SVG</p>
              </div>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}

function DraggableCoverImage({
  image,
  x,
  y,
  onChange,
}: {
  image?: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;

    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    origin.current = { x, y };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    onChange(origin.current.x + dx, origin.current.y + dy);
  };

  const handleUp = () => {
    dragging.current = false;
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#103663]">Cover Image</p>

      <div
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-[#D5DADF] bg-[#EEF4FA] cursor-grab active:cursor-grabbing"
      >
        {image ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: "url('/proposal/cover/photo-mask.png')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
                maskImage: "url('/proposal/cover/photo-mask.png')",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(1.15)`,
                }}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover pointer-events-none"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-[#4F8DC9]/40" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#4A596E]">
            Upload cover image first
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-[#4A596E]">
        Click and drag to reposition the image.
      </p>
    </div>
  );
}
