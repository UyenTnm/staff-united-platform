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
        <div className="header">
          <div className="logo-group">
            <Image
              src="/proposal/cover/logo.png"
              alt="STAFF"
              width={158}
              height={72}
            />

            <div className="divider" />

            <div className="client-logo">
              {data.clientLogo ? (
                <Image
                  src={data.clientLogo}
                  alt="Client"
                  width={158}
                  height={72}
                  className="object-contain"
                />
              ) : (
                <>
                  <span>PARTNER COMPANY</span>
                  <span>LOGO HERE</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="body">
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
              <strong>{data.totalPrice}</strong>
            </div>
          </div>

          {/* Preferred Rate */}
          <div className="rate-card">
            <div className="rate-left">
              <p>Preferred Partnership Rate</p>

              <h2>{data.finalPrice}</h2>

              <div className="save-line" />

              <h4>{data.savePrice}</h4>
            </div>

            <div className="rate-right">
              <div className="discount-box">
                <TicketPercent size={20} />

                <div className="percent">
                  {data.discount}
                  <small>Off</small>
                </div>
              </div>

              {/* NEW */}
              <p className="total-label">(TOTAL PRICE {data.currency})</p>
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
    </PageShell>
  );
}
