import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = { title: "Créneaux · CBN" };

type Creneau = { jour: string; horaire: string; niveau: string };
type Salle = { nom: string; adresse: string; note: string | null; creneaux: Creneau[] };
type Zone = { zone: string; salles: Salle[] };

async function getZones(): Promise<Zone[]> {
  const { data: salles, error } = await supabase
    .from("salles")
    .select("id, zone, nom, adresse, note, creneaux(jour, horaire, niveau)");

  if (error || !salles) return [];

  const zonesMap = new Map<string, Salle[]>();
  for (const s of salles) {
    const salle: Salle = {
      nom: s.nom,
      adresse: s.adresse,
      note: s.note,
      creneaux: s.creneaux,
    };
    zonesMap.set(s.zone, [...(zonesMap.get(s.zone) ?? []), salle]);
  }

  return [...zonesMap.entries()].map(([zone, salles]) => ({ zone, salles }));
}

export default async function Creneaux() {
  const ZONES = await getZones();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
        Créneaux
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
        8 salles, réparties sur toute la ville
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">
        Le club joue dans plusieurs gymnases à Nice, chacun avec son propre
        groupe WhatsApp pour la gestion des présences et des clés. La
        réservation en ligne (deuxième chantier de l'espace membre) viendra
        remplacer cette coordination manuelle.
      </p>

      <div className="mt-14 space-y-16">
        {ZONES.map((zone) => (
          <section key={zone.zone}>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-red-deep">
              {zone.zone}
            </h2>
            <div className="mt-6 space-y-8">
              {zone.salles.map((salle) => (
                <div key={salle.nom} className="border-l-2 border-ink/10 pl-5">
                  <h3 className="font-display text-base font-bold text-ink">
                    {salle.nom}
                  </h3>
                  <p className="mt-1 text-sm text-ink/50">{salle.adresse}</p>
                  {salle.note && (
                    <p className="mt-2 text-xs leading-relaxed text-red-deep">
                      {salle.note}
                    </p>
                  )}
                  <div className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
                    {salle.creneaux.map((c, i) => (
                      <div
                        key={i}
                        className="grid gap-1 py-3 text-sm sm:grid-cols-3 sm:items-baseline sm:gap-4"
                      >
                        <p className="font-semibold text-ink">{c.jour}</p>
                        <p className="font-mono text-ink/70">{c.horaire}</p>
                        <p className="text-ink/55">{c.niveau}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
