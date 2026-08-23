"use client";

import { ReactNode } from "react";
import "./page-shell.css";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageShell({ children, className = "" }: Props) {
  return (
    <div className="proposal-preview">
      <div className={`proposal-page ${className}`}>{children}</div>
    </div>
  );
}
