"use client";

import "./cover-page.css";
import PageShell from "../ui/PageShell";
import { CoverPageData } from "../types";
import Image from "next/image";
import {
  User,
  Building2,
  CalendarDays,
  Eye,
  MessageCircle,
  Handshake,
  ChartColumn,
  Icon,
  LucideIcon,
} from "lucide-react";

interface Props {
  data: CoverPageData;
}

export default function CoverPage({ data }: Props) {
  const details = [...data.proposalDetails].slice(0, 5);

  return (
    <PageShell className="bg-[#041F43]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/proposal/cover/cover-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT LEAF IMAGE */}
      <div className="absolute inset-y-0 right-0 w-[80%]">
        <div className="absolute right-0 top-0 h-[65%] w-[70%]">
          {/* Ảnh */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage: "url('/proposal/cover/photo-mask.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "right top",
              WebkitMaskSize: "100% 100%",
              maskImage: "url('/proposal/cover/photo-mask.png')",
              maskRepeat: "no-repeat",
              maskPosition: "right top",
              maskSize: "100% 100%",
            }}
          >
            {data.coverImage?.trim() ? (
              <div
                className="absolute"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `
          translate(
            ${data.coverPositionX ?? 0}px,
            ${data.coverPositionY ?? 0}px
          )
          scale(${data.coverScale ?? 1.15})
        `,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={data.coverImage}
                  alt="Cover Image"
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>

          {/* Border */}
          {/* <div className="absolute inset-0 z-20">
            <Image
              src="/proposal/cover/border-mask.png"
              alt=""
              fill
              className="object-fill"
            />
          </div> */}

          <div
            className="absolute z-20 pointer-events-none"
            style={{
              top: "-30px", // ↑ ↓
              right: "-57px", // ← →
              bottom: "-5px",
              left: "-20px",
            }}
          >
            <Image
              src="/proposal/cover/border-mask.png"
              alt=""
              fill
              className="object-contain object-right-top"
            />
          </div>
        </div>
      </div>

      {/* Blue Wave */}
      <div className="absolute bottom-62 left-0 w-full z-20">
        <Image
          src="/proposal/cover/wave.png"
          alt=""
          width={794}
          height={210}
          className="w-full h-auto"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 scope-main flex h-full flex-col text-white">
        {/* Logos */}
        {/* Logos */}
        <div className="cover-logo-group">
          {/* STAFF LOGO */}
          <div className="cover-logo-slot">
            <Image
              src="/logo.png"
              alt="STAFF United"
              fill
              sizes="140px"
              className="cover-logo-image"
            />
          </div>

          {/* DIVIDER */}
          <div className="cover-logo-divider" />

          {/* CLIENT LOGO */}
          <div className="cover-logo-slot">
            {data.clientLogo ? (
              <Image
                src={data.clientLogo}
                alt="Client Logo"
                fill
                sizes="140px"
                className="cover-logo-image"
              />
            ) : (
              <span className="cover-client-placeholder">CLIENT LOGO</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-12 max-w-[54%]">
          <h1
            className="line-clamp-2 text-[58px] font-semibold leading-[1.02]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {data.proposalTitle}
          </h1>

          <div className="mt-5 h-[3px] w-44 bg-[#59A8FF]" />

          <h2 className="mt-4 text-[30px] font-bold leading-none text-[#59A8FF]">
            PROPOSAL
          </h2>
          <h2 className="text-[30px] font-bold leading-none text-[#59A8FF]">
            & PRICING
          </h2>
        </div>

        {/* Proposal Detail */}
        <div className="mt-8 space-y-4 max-w-[54%]">
          {details.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </div>

        <div className="flex-1" />

        {/* Information */}
        <div className="mt-8 grid gap-5 max-w-[54%]">
          <Info icon={User} title="Prepared For" value={data.preparedFor} />
          <Info icon={Building2} title="Prepared By" value={data.preparedBy} />
          <Info icon={CalendarDays} title="Date" value={data.date} />
        </div>

        <div className="h-24" />

        {/* Bottom Features */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <Feature icon={Eye} t1="STRONG" t2="VISIBILITY" />

          <Feature icon={MessageCircle} t1="CLEAR" t2="COMMUNICATION" />

          <Feature icon={Handshake} t1="TRUSTED" t2="PARTNERSHIPS" />

          <Feature icon={ChartColumn} t1="DRIVING" t2="GROWTH" />
        </div>

        <div className="mt-5 border-t border-white/20 pt-3 text-center">
          <p className="text-xs text-white/80">
            Confidential — For Intended Recipient Only
          </p>

          <p className="mt-2 text-[22px] font-bold tracking-[0.28em] text-[#59A8FF]">
            ALL WOMEN. ALL BUSINESS.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Info({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#59A8FF]">
        <Icon size={28} strokeWidth={1.8} className="text-[#59A8FF]" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-[#59A8FF]">
          {title}
        </p>
        <p className="text-large font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  t1,
  t2,
}: {
  icon: React.ElementType;
  t1: string;
  t2: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#59A8FF]">
        <Icon size={24} strokeWidth={1.8} className="text-[#59A8FF]" />
      </div>

      <p className="text-[11px] font-semibold tracking-wide">{t1}</p>
      <p className="text-[11px] text-white/90">{t2}</p>
    </div>
  );
}
