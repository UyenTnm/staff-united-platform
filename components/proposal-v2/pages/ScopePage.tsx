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
          <div className="scope-logo-group">
            {/* STAFF LOGO */}
            <div className="scope-logo-slot">
              <Image
                src="/logo.png"
                alt="STAFF United"
                fill
                sizes="140px"
                className="scope-logo-image"
              />
            </div>

            {/* DIVIDER */}
            <div className="scope-logo-divider" />

            {/* CLIENT LOGO */}
            <div className="scope-logo-slot">
              {data.clientLogo ? (
                <Image
                  src={data.clientLogo}
                  alt="Client Logo"
                  fill
                  sizes="140px"
                  className="scope-logo-image"
                />
              ) : (
                <span className="scope-client-placeholder">CLIENT LOGO</span>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Image */}
        <div className="hero-image">
          {data.scopeImage ? (
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: "url('/proposal/cover/photo-mask-1.png')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "right top",
                WebkitMaskSize: "contain",

                maskImage: "url('/proposal/cover/photo-mask-1.png')",
                maskRepeat: "no-repeat",
                maskPosition: "right top",
                maskSize: "contain",
              }}
            >
              <Image
                src={data.scopeImage}
                alt="Scope Cover"
                fill
                className="object-cover"
                style={{
                  transform: `
            translate(
              ${data.scopeImagePositionX ?? 0}px,
              ${data.scopeImagePositionY ?? 0}px
            )
            scale(${data.scopeImageScale ?? 1})
          `,
                  transformOrigin: "center center",
                }}
              />
            </div>
          ) : (
            <Image
              src="/proposal/cover/photo-mask-1.png"
              alt="Scope Cover Placeholder"
              fill
              className="object-contain object-right-top"
            />
          )}
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
                <span>
                  {item.price} {data.currency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Strategic Package */}
        {/* Strategic Partnership Package */}
        <div className="price-card">
          {/* LEFT — Final Client Price */}
          <div className="price-left">
            <p className="price-package-name">{data.packageName}</p>

            <div className="final-price">
              <span>{data.totalPrice}</span>
              <small>{data.currency}</small>
            </div>

            <p className="preferred-rate">(Preferred Client Rate)</p>
          </div>

          {/* RIGHT — Discount */}
          <div className="discount-area">
            <div className="discount-box">
              <div className="discount-top">
                <TicketPercent size={26} />

                <strong>{data.discount}%</strong>

                <span>DISCOUNT</span>
              </div>

              <div className="original-price">
                {data.originalPrice} {data.currency}
              </div>

              {/* <div className="original-price">{data.originalPrice} VND</div> */}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="payment-box">
          <h3>PAYMENT TERMS</h3>

          <ul>
            {data.paymentTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
