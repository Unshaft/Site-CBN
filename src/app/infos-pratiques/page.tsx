import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Infos pratiques · CBN" };

const TARIFS = [
  { formule: "Jeunes", prix: "259 €", detail: "Minibad à Junior · licence FFBaD + encadrement inclus" },
  { formule: "Loisir — 1ère inscription", prix: "259 €", detail: "Adulte · licence FFBaD incluse" },
  { formule: "Loisir — renouvellement", prix: "209 €", detail: "Adulte déjà licencié au club" },
  { formule: "Compétiteur", prix: "279 €", detail: "Adulte · interclubs & tournois, licence incluse" },
];

const REDUCTIONS = [
  { label: "e-pass jeunes", montant: "−20 €" },
  { label: "Réduction famille", montant: "−15 €" },
  { label: "Pass'Sport", montant: "−70 €" },
  { label: "Deuxième entraînement hebdo", montant: "+50 €" },
];

export default function InfosPratiques() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Infos pratiques
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
        Ce qu'il faut savoir
      </h1>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink">Où jouer</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
          Le club joue dans 8 salles réparties sur Nice Ouest, Est et Centre —
          collèges, facultés et campus. Chaque salle a ses propres horaires et
          son groupe WhatsApp dédié.
        </p>
        <Link
          href="/creneaux"
          className="mt-4 inline-flex items-center text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          Voir toutes les salles et créneaux →
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink">
          Cotisation {new Date().getFullYear()}/{new Date().getFullYear() + 1}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {TARIFS.map((t) => (
            <div key={t.formule} className="border-l-2 border-red pl-5">
              <p className="text-xs uppercase tracking-widest text-ink/45">{t.formule}</p>
              <p className="mt-2 font-display text-2xl font-bold text-ink">{t.prix}</p>
              <p className="mt-1 text-sm text-ink/55">{t.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-sm border border-ink/10 bg-red-soft/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink">
            Réductions cumulables
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {REDUCTIONS.map((r) => (
              <li key={r.label} className="flex justify-between text-sm text-ink/65">
                <span>{r.label}</span>
                <span className="font-mono font-semibold text-ink">{r.montant}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink">Inscription</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
          L'inscription se fait en deux temps : la demande de licence et le
          règlement de la cotisation en ligne sur MyFFBaD, puis validation du
          dossier par le club.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-ink">Contact</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
          <a
            href="mailto:contact@cbn06.fr"
            className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
          >
            contact@cbn06.fr
          </a>
          {" "}·{" "}
          <a
            href="tel:+33769593990"
            className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
          >
            07 69 59 39 90
          </a>
        </p>
      </section>
    </div>
  );
}
