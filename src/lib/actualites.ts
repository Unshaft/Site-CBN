import { supabase } from "@/lib/supabase";

export type Actualite = {
  titre: string;
  categorie: string;
  extrait: string;
  date_debut: string;
  date_fin: string | null;
};

const MOIS = [
  "JANV", "FÉV", "MARS", "AVR", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC",
];

export async function getActualites(limit?: number): Promise<Actualite[]> {
  let query = supabase
    .from("actualites")
    .select("titre, categorie, extrait, date_debut, date_fin")
    .order("date_debut", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return data ?? [];
}

// "04 JUIL 2026" (date simple) ou "15–20 JUIN 2026" (plage) ; withYear=false
// pour le format court de l'accueil ("04 JUIL").
export function formatDate(date_debut: string, date_fin: string | null, withYear: boolean): string {
  const debut = new Date(`${date_debut}T00:00:00`);
  const jour = String(debut.getDate()).padStart(2, "0");
  const mois = MOIS[debut.getMonth()];
  const annee = debut.getFullYear();

  if (date_fin && date_fin !== date_debut) {
    const fin = new Date(`${date_fin}T00:00:00`);
    const jourFin = String(fin.getDate()).padStart(2, "0");
    if (fin.getMonth() === debut.getMonth() && fin.getFullYear() === annee) {
      return withYear ? `${jour}–${jourFin} ${mois} ${annee}` : `${jour}–${jourFin} ${mois}`;
    }
    const moisFin = MOIS[fin.getMonth()];
    return withYear
      ? `${jour} ${mois}–${jourFin} ${moisFin} ${annee}`
      : `${jour} ${mois}–${jourFin} ${moisFin}`;
  }

  return withYear ? `${jour} ${mois} ${annee}` : `${jour} ${mois}`;
}
