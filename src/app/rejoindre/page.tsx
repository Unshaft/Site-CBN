import type { Metadata } from "next";
import ParcoursSwitcher from "@/components/ParcoursSwitcher";

export const metadata: Metadata = { title: "Rejoindre le club · CBN" };

export default function Rejoindre() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Rejoindre le club
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        Ta situation, pour savoir par où commencer
      </h1>

      <div className="mt-10">
        <ParcoursSwitcher />
      </div>

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
