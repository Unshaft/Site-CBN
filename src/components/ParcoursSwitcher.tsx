"use client";

import { useState } from "react";
import Link from "next/link";

const MYFFBAD_URL = "https://www.myffbad.fr/adherer/CBN06";

type Persona = "nouveau" | "licencie" | "parent";

const ONGLETS: { id: Persona; label: string }[] = [
  { id: "nouveau", label: "Je n'ai jamais été licencié·e" },
  { id: "licencie", label: "Je suis déjà licencié·e" },
  { id: "parent", label: "J'inscris mon enfant" },
];

const PARCOURS: Record<
  Persona,
  { bouton: string; note: string; etapes: { title: string; detail: React.ReactNode }[] }
> = {
  nouveau: {
    bouton: "S'inscrire sur MyFFBaD",
    note: "Compte, environ 5 minutes, paiement en ligne inclus.",
    etapes: [
      {
        title: "Fais ta demande de licence",
        detail: "Crée ta demande sur MyFFBaD et règle ta cotisation en ligne.",
      },
      {
        title: "Le club valide ton dossier",
        detail:
          "Le bureau valide ton inscription et t'ajoute aux groupes WhatsApp de tes créneaux.",
      },
      {
        title: "Crée ton compte sur le site",
        detail: (
          <>
            Dans{" "}
            <Link
              href="/espace-membre"
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              l'espace membre
            </Link>
            , pour remplir ta fiche (contact, urgence...) et retrouver tes
            infos d'une saison à l'autre. C'est un compte différent de ta
            licence FFBaD.
          </>
        ),
      },
      {
        title: "Choisis tes créneaux",
        detail: (
          <>
            Consulte{" "}
            <Link
              href="/creneaux"
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              les 8 salles du club
            </Link>{" "}
            et rejoins les créneaux qui correspondent à ton niveau et ton
            secteur.
          </>
        ),
      },
    ],
  },
  licencie: {
    bouton: "Renouveler sur MyFFBaD",
    note: "Connecte-toi avec ton compte MyFFBaD existant.",
    etapes: [
      {
        title: "Renouvelle ta licence",
        detail:
          "Même démarche que la première année, mais à tarif renouvellement — connecte-toi avec ton compte MyFFBaD existant.",
      },
      {
        title: "Crée ton compte sur le site (si tu n'en as pas encore)",
        detail: (
          <>
            Ce site est nouveau — même si tu es licencié·e depuis longtemps,
            tu n'as peut-être pas encore de compte dans{" "}
            <Link
              href="/espace-membre"
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              l'espace membre
            </Link>
            . Ça ne change rien à ta licence, ça sert juste à remplir ta
            fiche.
          </>
        ),
      },
      {
        title: "Choisis tes créneaux",
        detail: (
          <>
            Consulte{" "}
            <Link
              href="/creneaux"
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              les 8 salles du club
            </Link>{" "}
            si tu veux changer de secteur ou de niveau cette saison.
          </>
        ),
      },
    ],
  },
  parent: {
    bouton: "Inscrire mon enfant sur MyFFBaD",
    note: "En tant que responsable légal.",
    etapes: [
      {
        title: "Crée ton propre compte sur le site",
        detail: (
          <>
            Dans{" "}
            <Link
              href="/espace-membre"
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              l'espace membre
            </Link>
            , avec ton email à toi (le parent).
          </>
        ),
      },
      {
        title: "Ajoute le profil de ton enfant",
        detail:
          "Depuis ton espace membre, bouton « Ajouter le profil de mon enfant ». Tu pourras remplir sa fiche et récupérer un code pour qu'il/elle crée son propre compte plus tard.",
      },
      {
        title: "Fais sa demande de licence",
        detail: "Sur MyFFBaD, en tant que responsable légal.",
      },
      {
        title: "Le club valide le dossier",
        detail:
          "Le bureau valide l'inscription et vous ajoute aux groupes WhatsApp des créneaux jeunes.",
      },
    ],
  },
};

export default function ParcoursSwitcher() {
  const [persona, setPersona] = useState<Persona>("nouveau");
  const parcours = PARCOURS[persona];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPersona(o.id)}
            aria-current={persona === o.id}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              persona === o.id
                ? "border-red bg-red text-feather"
                : "border-ink/15 text-ink/60 hover:border-ink/30"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-9 flex flex-col items-center">
        <a
          href={MYFFBAD_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-sm bg-red px-8 py-4 text-sm font-semibold text-feather transition-colors hover:bg-red-deep"
        >
          {parcours.bouton}
        </a>
        <p className="mt-2 text-xs text-ink/45">{parcours.note}</p>
      </div>

      <ol className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
        {parcours.etapes.map((e, i) => (
          <li key={e.title} className="grid gap-3 py-7 sm:grid-cols-[64px_1fr]">
            <span className="font-mono text-2xl text-red-deep">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">{e.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{e.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
