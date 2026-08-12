import type { Metadata } from "next";

export const metadata: Metadata = { title: "Espace membre · CBN" };

const CHANTIERS = [
  {
    num: "01",
    title: "Profil & cotisation",
    detail:
      "Statut de cotisation en temps réel, paiement en ligne ou en plusieurs fois, reçu et attestation téléchargeables.",
  },
  {
    num: "02",
    title: "Réservation de créneaux",
    detail:
      "Réserver un terrain, voir les places restantes par créneau, s'inscrire aux tournois internes.",
  },
  {
    num: "03",
    title: "Achats du club",
    detail:
      "Commander volants, cordage et textile floqué, suivre les achats groupés de la saison.",
  },
  {
    num: "04",
    title: "Comptabilité du club",
    detail:
      "Suivi des recettes et dépenses pour le bureau, export pour l'assemblée générale.",
  },
  {
    num: "05",
    title: "Notifications WhatsApp",
    detail:
      "Rappels de créneaux, d'échéances de cotisation et d'événements envoyés dans le groupe du club.",
  },
];

export default function EspaceMembre() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Espace membre
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
        En construction, point par point.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/65">
        L'espace membre remplace progressivement ce qu'on utilisait ailleurs.
        Voici les chantiers prévus pour cette saison, dans l'ordre où ils
        arriveront.
      </p>

      <ol className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
        {CHANTIERS.map((c) => (
          <li key={c.num} className="grid gap-3 py-7 sm:grid-cols-[64px_1fr]">
            <span className="font-mono text-2xl text-red-deep">{c.num}</span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {c.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
