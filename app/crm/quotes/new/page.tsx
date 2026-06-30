"use client";

import { Suspense } from "react";
import CreateQuoteContent from "./CreateQuoteContent";

export default function CreateQuotePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreateQuoteContent />
    </Suspense>
  );
}
