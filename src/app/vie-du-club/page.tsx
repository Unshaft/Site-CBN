import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vie du club · CBN" };

const ARTICLES = [
  {
    date: "04 JUIL 2026",
    category: "Événement",
    title: "🎉 Fête du Club",
    excerpt:
      "De 10h à 19h au STAPS de Nice : remise des trophées, assemblée générale, matchs et animations pour les jeunes. Le rendez-vous de fin de saison du club.",
  },
  {
    date: "JUIN 2026",
    category: "Annonce",
    title: "Bienvenue sur l'application du CBN",
    excerpt:
      "Le club se dote d'un nouvel outil pour rester connecté toute la saison. Cette refonte du site en est la suite directe.",
  },
  {
    date: "15–20 JUIN 2026",
    category: "Convivialité",
    title: "La Semaine de la Convivialité",
    excerpt:
      "Une semaine d'animations et de moments partagés entre membres, tous niveaux confondus, pour clôturer la saison dans la bonne humeur.",
  },
];

export default function VieDuClub() {
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
        {ARTICLES.map((article) => (
          <article key={article.title} className="grid gap-3 py-8 sm:grid-cols-[140px_1fr]">
            <div>
              <p className="font-mono text-xs text-ink/45">{article.date}</p>
              <span className="mt-2 inline-block rounded-sm bg-red-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                {article.category}
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                {article.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {article.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
