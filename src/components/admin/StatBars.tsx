type Repartition = { label: string; effectif: number }[];

export default function StatBars({
  title,
  data,
  total,
}: {
  title: string;
  data: Repartition;
  total: number;
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {data.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink/75">{row.label}</span>
              <span className="font-mono text-ink/50">{row.effectif}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-ink/10">
              <div
                className="h-1.5 rounded-full bg-red"
                style={{ width: `${total ? (row.effectif / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
