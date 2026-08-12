import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rejoindre le club · CBN" };

const ETAPES = [
  {
    num: "01",
    title: "Créez votre demande de licence",
    detail:
      "Rendez-vous sur MyFFBaD pour créer votre demande de licence et régler votre cotisation en ligne.",
  },
  {
    num: "02",
    title: "Le club valide votre dossier",
    detail:
      "Une fois la demande reçue, le bureau du club valide votre inscription et vous ajoute aux groupes WhatsApp de vos créneaux.",
  },
  {
    num: "03",
    title: "Choisissez vos créneaux",
    detail:
      "Consultez les 8 salles du club et rejoignez les créneaux qui correspondent à votre niveau et votre secteur.",
  },
];

export default function Rejoindre() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Rejoindre le club
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        Trois étapes pour devenir membre
      </h1>

      <div className="mt-9 flex justify-center">
        <a
          href="https://www.myffbad.fr/adherer/CBN06"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-sm bg-red px-8 py-4 text-sm font-semibold text-feather transition-colors hover:bg-red-deep"
        >
          S'inscrire sur MyFFBaD
        </a>
      </div>

      <ol className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
        {ETAPES.map((e) => (
          <li key={e.num} className="grid gap-3 py-7 sm:grid-cols-[64px_1fr]">
            <span className="font-mono text-2xl text-red-deep">{e.num}</span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                {e.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {e.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-center text-sm leading-relaxed text-ink/65">
        Une question avant de vous lancer ?{" "}
        <a
          href="mailto:contact@cbn06.fr"
          className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          contact@cbn06.fr
        </a>{" "}
        ·{" "}
        <a
          href="tel:+33769593990"
          className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          07 69 59 39 90
        </a>
      </p>
    </div>
  );
}
