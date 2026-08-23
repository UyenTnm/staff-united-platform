"use client";

import "./scope-page.css";
import PageShell from "../ui/PageShell";
import { ScopePageData } from "../types";
import Image from "next/image";
import { TicketPercent } from "lucide-react";

interface Props {
  data: ScopePageData;
}

export default function ScopePage({ data }: Props) {
  return (
    <PageShell className="scope-page">
      {/* Background */}
      <Image
        src="/proposal/cover/cover-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="scope-content">
        {/* Header */}
        <div className="header">
          <div className="flex items-center gap-4">
            <Image
              src="/proposal/cover/logo.png"
              alt="STAFF United"
              width={158}
              height={72}
            />

            <div className="divider" />

            <div>
              <p className="partner">PARTNER COMPANY</p>
              <p className="partner">LOGO HERE</p>
            </div>
          </div>
        </div>

        {/* Top Right Image */}
        <div className="hero-image">
          <Image
            src="/proposal/cover/photo-mask-1.png"
            alt=""
            fill
            className="object-contain object-right-top"
          />
        </div>

        {/* Title */}
        <div className="title-area">
          <h1 className="scope-title">{data.projectTitle}</h1>

          <div className="scope-divider">
            <span className="dot" />

            <div className="line left" />

            <span className="label">SCOPE OF SERVICES</span>

            <div className="line right" />

            <span className="dot" />
          </div>
        </div>

        {/* Package Cards */}
        <div className="package-list">
          {data.services.map((item, index) => (
            <div key={index} className="package-card">
              <div className="left">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className="right">
                <span>{item.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Strategic Package */}
        <div className="price-card">
          <div className="price-left">
            <p>STRATEGIC PARTNERSHIP PACKAGE</p>

            <h2>PRICE</h2>

            <div className="price-row">
              <span className="currency">VND</span>
              <small>(Preferred Client Rate)</small>
            </div>
          </div>

          <div className="discount-box">
            <TicketPercent size={22} />
            <strong>0%</strong>
          </div>
        </div>

        {/* Payment */}
        <div className="payment-box">
          <h3>PAYMENT TERMS</h3>

          <ul>
            <li>50% deposit required to initiate the project.</li>
            <li>50% final payment upon completion.</li>
            <li>Additional work will be quoted separately.</li>
            <li>Text</li>
            <li>Text</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
