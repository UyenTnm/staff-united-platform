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

interface Props {
  data: PricingPageData;
}

export default function PricingPage({ data }: Props) {
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
            <Image
              src="/proposal/cover/logo.png"
              alt="logo"
              width={158}
              height={72}
            />

            <div className="partner-line" />

            <div className="partner-text">
              PARTNER COMPANY
              <br />
              LOGO HERE
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
        <div className="body">
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
              <ClipboardCheck size={22} color="#0058C8" />
              <span>KEY DELIVERABLES</span>
            </div>

            {data.deliverables.map((item, index) => (
              <div key={index} className="check-item">
                <CheckSquare size={18} color="#0058C8" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="bottom-cards">
            <div className="info-card">
              <Image
                src="/proposal/cover/bg-timeline.svg"
                alt=""
                fill
                className="bg object-cover"
              />

              <div className="content">
                <CalendarDays size={34} color="#6EC1FF" />

                <div className="divider" />

                <div>
                  <h4>TIMELINE</h4>
                  <p>{data.timeline}</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <Image
                src="/proposal/cover/bg-price.svg"
                alt=""
                fill
                className="bg object-cover"
              />

              <div className="content">
                <CircleDollarSign size={34} color="#6EC1FF" />

                <div className="divider" />

                <div>
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
