import { notFound } from "next/navigation";

import { validatePublicQuote, markQuoteViewed } from "@/lib/crm/public-quote";

export default async function PublicQuotePage({
  params,
}: {
  params: { token: string };
}) {
  const result = await validatePublicQuote(params.token);

  if (!result.valid) {
    return notFound();
  }

  await markQuoteViewed(params.token);

  const quote = result.record.quote;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-10">
        {/* Header */}
        <header className="mb-10 rounded-3xl bg-[#0A1B33] p-10 text-white">
          <p className="text-sm uppercase tracking-widest text-slate-300">
            STAFF United Proposal
          </p>

          <h1 className="mt-3 text-4xl font-bold">{quote.company_name}</h1>

          <p className="mt-4 text-lg text-slate-300">
            Proposal #{quote.quote_number}
          </p>
        </header>

        {/* Welcome */}
        <section className="mb-8 rounded-2xl bg-blue-50 border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome, {quote.contact_name}
          </h2>

          <p className="mt-4 text-slate-600 leading-7">
            Thank you for considering STAFF United as your long-term execution
            partner. This proposal has been prepared specifically for your
            business. Please review the information below and let us know if you
            have any questions before accepting.
          </p>
        </section>

        {/* Company */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold">Company Information</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Company</p>
              <p className="font-medium">{quote.company_name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Contact</p>
              <p className="font-medium">{quote.contact_name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p>{quote.contact_email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Department</p>
              <p>{quote.department}</p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold">Services</h2>

          <h3 className="text-xl font-medium">{quote.title}</h3>

          <p className="mt-4 whitespace-pre-wrap text-slate-700">
            {quote.notes}
          </p>
        </section>

        {/* Pricing */}
        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold">Investment</h2>

          <p className="text-5xl font-bold">
            {quote.currency_code} {Number(quote.amount).toLocaleString()}
          </p>
        </section>

        {/* Notes */}

        {/* Accept */}
        <section className="mt-10 flex justify-center">
          <button
            className="
      rounded-full
      bg-blue-600
      px-8
      py-4
      text-lg
      font-semibold
      text-white
      transition
      hover:bg-blue-700
    "
          >
            Accept Proposal
          </button>
        </section>
      </div>
    </main>
  );
}
