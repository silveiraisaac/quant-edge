export function ConfigSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {title && <div className="flex items-center gap-2">
        <h3 className="qe-section-label">{title}</h3>
        {badge && <span className="qe-badge-soon">{badge}</span>}
      </div>}
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
