"use client";

import "./partnership-page.css";
import PageShell from "../ui/PageShell";
import { PartnershipPageData } from "../types";
import Image from "next/image";
import { TicketPercent } from "lucide-react";

interface Props {
  data: PartnershipPageData;
}

export default function PartnershipPage({ data }: Props) {
  return (
    <PageShell className="partnership-page">
      {/* White background */}
      <div className="absolute inset-0 bg-white" />

      {/* Top & Bottom Wave */}
      <Image
        src="/proposal/cover/wave-top.svg"
        alt=""
        width={794}
        height={140}
        className="wave-top"
      />

      <Image
        src="/proposal/cover/wave-bottom.png"
        alt=""
        width={794}
        height={140}
        className="wave-bottom"
      />

      <div className="partnership-content">
        {/* HEADER */}
        {/* HEADER */}
        <div className="header">
          <div className="partnership-logo-group">
            {/* STAFF LOGO */}
            <div className="partnership-logo-slot">
              <Image
                src="/logo.png"
                alt="STAFF United"
                fill
                sizes="140px"
                className="partnership-logo-image"
              />
            </div>

            {/* DIVIDER */}
            <div className="partnership-logo-divider" />

            {/* CLIENT LOGO */}
            <div className="partnership-logo-slot">
              {data.clientLogo ? (
                <Image
                  src={data.clientLogo}
                  alt="Client Logo"
                  fill
                  sizes="140px"
                  className="partnership-logo-image"
                />
              ) : (
                <span className="partnership-client-placeholder">
                  PARTNER COMPANY
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        {/* BODY */}
        <div className="body">
          <div className="partnership-main-content">
            <h1>{data.packageName}</h1>

            {/* Individual Packages */}
            <div className="package-table">
              <h3>INDIVIDUAL PACKAGES</h3>

              {data.individualPackages.map((item, i) => (
                <div key={i} className="row">
                  <span>{item.title}</span>
                  <span>{item.price}</span>
                </div>
              ))}

              <div className="total">
                <strong>TOTAL</strong>

                <strong>
                  {data.totalPrice} {data.currency}{" "}
                </strong>
              </div>
            </div>

            {/* Preferred Rate */}
            <div className="rate-card">
              <div className="rate-left">
                <p>Preferred Partnership Rate</p>

                <h2>
                  {data.finalPrice} {data.currency}
                </h2>

                <div className="save-line" />

                <h4>
                  SAVE {data.savePrice} {data.currency}
                </h4>
              </div>

              <div className="rate-right">
                <div className="discount-box">
                  <TicketPercent size={24} strokeWidth={2} />

                  <div className="discount-percent">
                    <strong>{data.discount} %</strong>
                  </div>

                  <span className="discount-off">Off</span>
                </div>

                <div className="original-price">
                  {/* <span>(TOTAL PRICE {data.currency})</span> */}

                  <strong>
                    {data.totalPrice} {data.currency}
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="payment">
              <h3>PAYMENT TERMS</h3>

              <ul>
                {data.paymentTerms.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
