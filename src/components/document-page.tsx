export interface DocumentSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function DocumentPage({
  eyebrow,
  title,
  intro,
  sections,
  effectiveDate,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: DocumentSection[];
  effectiveDate?: string;
}) {
  return (
    <main>
      <section className="border-b border-slate-200 bg-[var(--qe-navy-950)] text-white">
        <div className="qe-container py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--qe-accent)]">{eyebrow}</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-[-.035em] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{intro}</p>
          {effectiveDate && <p className="mt-4 text-xs font-semibold text-slate-400">Effective and last updated: {effectiveDate}</p>}
        </div>
      </section>
      <div className="qe-container grid gap-7 py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="qe-card p-4" aria-label={`${title} sections`}>
            <p className="qe-eyebrow px-2">On this page</p>
            <div className="mt-3 space-y-1">
              {sections.map((section) => <a key={section.title} href={`#${slug(section.title)}`} className="block rounded-lg px-2 py-2 text-xs font-semibold leading-5 text-slate-600 hover:bg-slate-50 hover:text-slate-900">{section.title}</a>)}
            </div>
          </nav>
        </aside>
        <article className="min-w-0 space-y-4">
          {sections.map((section, index) => (
            <section id={slug(section.title)} key={section.title} className="qe-card scroll-mt-24 p-5 sm:p-7">
              <div className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--qe-accent-soft)] text-xs font-bold text-[var(--qe-accent-dark)]">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h2 className="qe-title text-lg">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.bullets && <ul className="list-disc space-y-2 pl-5">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
