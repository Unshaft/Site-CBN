import type { Metadata } from "next";
import { getActualites, formatDate } from "@/lib/actualites";

export const metadata: Metadata = { title: "Vie du club · CBN" };
export const revalidate = 60;

export default async function VieDuClub() {
  const articles = await getActualites();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Vie du club
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
        Les actus du CBN
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">
        Annonces, événements, résultats de compétition — tout ce qui rythme la
        saison du club, dans l'ordre où ça arrive.
      </p>

      <div className="mt-14 divide-y divide-ink/10 border-t border-ink/10">
        {articles.map((article) => (
          <article key={article.titre} className="grid gap-3 py-8 sm:grid-cols-[140px_1fr]">
            <div>
              <p className="font-mono text-xs text-ink/45">
                {formatDate(article.date_debut, article.date_fin, true)}
              </p>
              <span className="mt-2 inline-block rounded-sm bg-red-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                {article.categorie}
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                {article.titre}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {article.extrait}
              </p>
            </div>
          </article>
        ))}
        {articles.length === 0 && (
          <p className="py-8 text-sm text-ink/60">Aucune actualité pour le moment.</p>
        )}
      </div>
    </div>
  );
}
