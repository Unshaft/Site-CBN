import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CreneauxTicker, { type Slot } from "@/components/CreneauxTicker";

const NEWS = [
  {
    date: "04 JUIL",
    title: "🎉 Fête du Club",
    excerpt:
      "De 10h à 19h au STAPS de Nice : remise des trophées, assemblée générale, matchs et animations jeunes.",
  },
  {
    date: "JUIN",
    title: "Bienvenue sur l'application du CBN",
    excerpt:
      "Le club se dote d'un nouvel outil pour rester connecté toute la saison — cette refonte du site en est la suite directe.",
  },
  {
    date: "15–20 JUIN",
    title: "La Semaine de la Convivialité",
    excerpt:
      "Une semaine d'animations et de moments partagés entre membres, tous niveaux confondus.",
  },
];

const PRATIQUE = [
  { label: "Lieu", value: "8 salles à Nice" },
  { label: "Créneaux", value: "7j/7 selon les salles" },
  { label: "Cotisation", value: "Dès 209€ / saison" },
];

async function getSlots(): Promise<Slot[]> {
  const { data, error } = await supabase
    .from("creneaux")
    .select("jour, horaire, niveau, salles(nom)")
    .order("jour");

  if (error || !data) return [];

  return data.map((c) => ({
    salle: (c.salles as unknown as { nom: string } | null)?.nom ?? "",
    jour: c.jour,
    horaire: c.horaire,
    niveau: c.niveau,
  }));
}

export default async function Home() {
  const slots = await getSlots();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-feather">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:pb-14 md:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-red">
            Club de Badminton de Nice · Saison 2026 / 2027
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Le badminton niçois,
            <br />
            organisé comme il le mérite.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-feather/70 md:text-lg">
            Créneaux, cotisation, compétitions et vie du club au même endroit —
            fini les PDF perdus et les rappels sur trois canaux différents.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/rejoindre"
              className="inline-flex items-center rounded-sm bg-red px-6 py-3.5 text-sm font-semibold text-ink-deep transition-colors hover:bg-red-deep"
            >
              Devenir membre
            </Link>
            <Link
              href="/creneaux"
              className="inline-flex items-center rounded-sm border border-feather/25 px-6 py-3.5 text-sm font-semibold text-feather transition-colors hover:border-feather/60"
            >
              Voir les créneaux
            </Link>
          </div>

          <CreneauxTicker slots={slots} />
        </div>

        {/* Signature: shuttle flight-arc divider */}
        <svg
          viewBox="0 0 1200 90"
          preserveAspectRatio="none"
          className="block h-20 w-full text-red"
          aria-hidden="true"
        >
          <path
            d="M0 84 Q 600 -50 1200 84"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.9"
            strokeWidth="2"
            className="shuttle-arc"
          />
        </svg>
      </section>

      {/* Vie du club preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
              Vie du club
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
              Ce qui se passe en ce moment
            </h2>
          </div>
          <Link
            href="/vie-du-club"
            className="hidden shrink-0 text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4 md:block"
          >
            Toutes les actus
          </Link>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 md:grid-cols-3">
          {NEWS.map((item) => (
            <article key={item.title} className="bg-feather p-7">
              <p className="font-mono text-xs uppercase tracking-widest text-red-deep">
                {item.date}
              </p>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                {item.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="court-rule" />
      </div>

      {/* Infos pratiques teaser */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
          Infos pratiques
        </p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-tight text-ink">
          Tout ce qu'il faut savoir avant de venir taper le volant.
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PRATIQUE.map((item) => (
            <div key={item.label} className="border-l-2 border-red pl-5">
              <p className="text-xs uppercase tracking-widest text-ink/45">
                {item.label}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-ink">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/infos-pratiques"
          className="mt-10 inline-flex items-center text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          Voir toutes les infos pratiques →
        </Link>
      </section>

      {/* Espace membre / roadmap teaser */}
      <section className="bg-red-soft/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
            Espace membre
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink">
            Votre saison, gérée depuis un seul endroit.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">
            Fini les relances par SMS et les tableurs partagés. L'espace
            membre du CBN centralise votre cotisation, vos réservations et vos
            achats — et vous prévient là où vous êtes déjà : sur WhatsApp.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 sm:grid-cols-3">
            <div className="bg-feather p-7">
              <h3 className="font-display text-base font-bold text-ink">
                Cotisation & paiement
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Statut à jour, paiement en ligne ou en plusieurs fois, reçu
                automatique.
              </p>
            </div>
            <div className="bg-feather p-7">
              <h3 className="font-display text-base font-bold text-ink">
                Achats du club
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Volants, cordage, textile floqué : commandez et suivez vos
                achats groupés.
              </p>
            </div>
            <div className="bg-feather p-7">
              <h3 className="font-display text-base font-bold text-ink">
                Notifs WhatsApp
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Rappels de créneaux et d'échéances envoyés directement dans le
                groupe du club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Prêt à rejoindre le CBN ?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/60">
          L'inscription se fait en ligne en moins de cinq minutes, essai
          gratuit pour votre première séance.
        </p>
        <Link
          href="/rejoindre"
          className="mt-8 inline-flex items-center rounded-sm bg-red px-8 py-4 text-sm font-semibold text-feather transition-colors hover:bg-red-deep"
        >
          Devenir membre
        </Link>
      </section>
    </>
  );
}
