interface QuoteTimelineProps {
  items: {
    title: string;
    date: string;
  }[];
}

export default function QuoteTimeline({ items }: QuoteTimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border-l-2 pl-4 pb-4">
          <div className="font-medium">{item.title}</div>

          <div className="text-sm text-muted-foreground">{item.date}</div>
        </div>
      ))}
    </div>
  );
}
