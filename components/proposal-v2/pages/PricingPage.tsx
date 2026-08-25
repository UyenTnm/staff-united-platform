"use client";

import "./pricing-page.css";
import PageShell from "../ui/PageShell";
import { PricingPageData } from "../types";
import Image from "next/image";
import {
  Target,
  ClipboardCheck,
  CheckSquare,
  CalendarDays,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  data: PricingPageData;
  onOverflowChange?: (overflow: boolean) => void;
}

export default function PricingPage({ data, onOverflowChange }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const bottomCardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [contentOverflow, setContentOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const content = contentRef.current;
      const bottomCards = bottomCardsRef.current;

      if (!content || !bottomCards) return;

      const contentBottom = content.getBoundingClientRect().bottom;

      const cardsTop = bottomCards.getBoundingClientRect().top;

      const safeGap = 12;

      const overflow = contentBottom > cardsTop - safeGap;

      setContentOverflow(overflow);
      onOverflowChange?.(overflow);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    if (bottomCardsRef.current) {
      observer.observe(bottomCardsRef.current);
    }

    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [data, onOverflowChange]);

  return (
    <PageShell className="pricing-page">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Top Wave */}
      <Image
        src="/proposal/cover/wave-top.svg"
        alt=""
        width={794}
        height={120}
        className="wave-top"
      />

      <div className="pricing-content">
        {/* HEADER */}
        <div className="pricing-header">
          <div className="partner-wrap">
            {/* STAFF LOGO */}
            <div className="logo-slot">
              <Image
                src="/logo.png"
                alt="STAFF United"
                fill
                sizes="140px"
                className="logo-image"
              />
            </div>

            {/* DIVIDER */}
            <div className="partner-line" />

            {/* CLIENT LOGO */}
            <div className="logo-slot">
              {data.clientLogo ? (
                <Image
                  src={data.clientLogo}
                  alt="Client Logo"
                  fill
                  sizes="140px"
                  className="logo-image"
                />
              ) : (
                <span className="client-placeholder">CLIENT LOGO</span>
              )}
            </div>
          </div>

          <div className="page-info">
            <div className="page-number">03</div>

            <div className="page-label">
              PROJECT
              <br />
              SCOPE &
              <br />
              DELIVERABLES
            </div>
          </div>
        </div>

        {/* BODY */}
        {/* BODY */}
        <div ref={bodyRef} className="body">
          {contentOverflow && (
            <div className="content-warning-test">
              ⚠️ PAGE CONTENT IS TOO LONG
            </div>
          )}
          {/* ACTUAL CONTENT */}
          <div ref={contentRef} className="pricing-main-content">
            <h1 className="package-title">{data.packageTitle}</h1>

            {/* Objective */}
            <div className="section-title">
              <Target size={22} color="#0058C8" />
              <span>STRATEGIC OBJECTIVE</span>
            </div>

            <p className="objective">{data.strategicObjective}</p>

            {/* Deliverables */}
            <div className="deliverables">
              <div className="section-title">
                <Image
                  src="/proposal/cover/key-deliverable.png"
                  alt=""
                  width={22}
                  height={22}
                />

                <span>KEY DELIVERABLES</span>
              </div>

              {data.deliverables.map((item, index) => (
                <div key={index} className="check-item">
                  <CheckSquare size={18} color="#0058C8" />

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Cards */}
          <div ref={bottomCardsRef} className="bottom-cards">
            {/* TIMELINE */}
            <div className="info-card">
              <Image
                src="/proposal/cover/bg-timeline.png"
                alt=""
                fill
                className="info-card-bg"
                sizes="100%"
              />

              <div className="info-card-inner">
                <div className="info-card-icon">
                  <CalendarDays size={42} color="#6EC1FF" strokeWidth={1.8} />
                </div>

                <div className="info-card-text">
                  <h4>TIMELINE</h4>
                  <p>{data.timeline}</p>
                </div>
              </div>
            </div>

            {/* PRICE */}
            <div className="info-card">
              <Image
                src="/proposal/cover/bg-price.png"
                alt=""
                fill
                className="info-card-bg"
                sizes="100%"
              />

              <div className="info-card-inner">
                <div className="info-card-icon">
                  <CircleDollarSign
                    size={42}
                    color="#6EC1FF"
                    strokeWidth={1.8}
                  />
                </div>

                <div className="info-card-text">
                  <h4>PRICE</h4>
                  <p>{data.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <Image
        src="/proposal/cover/wave-bottom.png"
        alt=""
        width={794}
        height={120}
        className="wave-bottom"
      />
    </PageShell>
  );
}
