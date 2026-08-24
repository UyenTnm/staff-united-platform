"use client";

import "./next-steps-page.css";
import PageShell from "../ui/PageShell";
import { NextStepsPageData } from "../types";
import Image from "next/image";
import { CheckCircle2, Mail } from "lucide-react";

interface Props {
  data: NextStepsPageData;
}

export default function NextStepsPage({ data }: Props) {
  return (
    <PageShell className="next-page">
      <div className="absolute inset-0 bg-[#082E63]" />

      <Image
        src="/proposal/cover/wave-bottom-shine.png"
        alt=""
        width={794}
        height={113}
        className="wave-bottom"
      />

      <div className="content">
        {/* Header */}
        {/* ---------- HEADER ---------- */}
        <div className="header-equation">
          {/* STAFF */}
          <Image
            src="/proposal/cover/logo.png"
            alt="STAFF"
            width={158}
            height={72}
          />

          {/* + */}
          <div className="operator">+</div>

          {/* CLIENT */}
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

          {/* = */}
          <div className="operator">=</div>

          {/* Result */}
          <div className="authority">
            <span>SCALABLE</span>
            <span>INDUSTRY</span>
            <span>AUTHORITY</span>
          </div>
        </div>

        <div className="title">
          <h1>NEXT STEPS TO BEGIN THIS PARTNERSHIP</h1>
        </div>

        {/* Steps */}
        <div className="steps">
          {data.nextSteps.map((step, i) => (
            <div key={i} className="step">
              <CheckCircle2 size={22} color="#67B8FF" />
              <div>
                <strong>Step {i + 1}</strong>
                <p>{step}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="closing-message">
          <p>{data.closingMessage}</p>
        </div>

        {/* Footer */}
        <div className="footer">
          <h3>STAFF United – All Women Offshore Execution Team</h3>

          <div className="contact-row">
            <span>Email:</span>
            <span>{data.email}</span>
          </div>

          <div className="contact-row">
            <span>Website:</span>
            <span>www.staffunitedgroup.com</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Footer */}
        {/* <div className="footer">
          <p>
            We look forward to supporting Vietnam’s leading businesses in
            strengthening brand visibility, professional market presence and
            business development across physical and digital channels.
          </p>

          <h3>STAFF United — All Women Offshore Execution Team</h3>

          <div className="email">
            <Mail size={16} />
            <span>{data.email}</span>
          </div>
        </div> */}
      </div>
    </PageShell>
  );
}
