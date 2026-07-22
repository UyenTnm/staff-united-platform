const stats = [
  {
    title: "Open Leads",
    value: "--",
  },
  {
    title: "Active Clients",
    value: "--",
  },
  {
    title: "Draft Quotes",
    value: "--",
  },
  {
    title: "Sent Quotes",
    value: "--",
  },
];

export default function QuickStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-slate-500">{item.title}</p>

          <h2 className="mt-3 text-4xl font-bold text-emerald-600">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
