"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSaisonActuelle } from "@/lib/saison";

type RoleClub = "adherent" | "bureau" | "entraineur" | "benevole";
type StatutCotisation = "paye" | "impaye" | "partiel";
type TypeLicence = "competition" | "traditionnelle" | "decouverte" | "entreprise" | "para";

type Licence = {
  numero_licence_ffbad: string | null;
  type_licence: TypeLicence | null;
  certificat_medical_valide: boolean;
};

type Membre = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  role_club: RoleClub;
  cotisations: { statut: StatutCotisation; saison: string }[];
  licences: Licence[];
};

const ROLES: RoleClub[] = ["adherent", "bureau", "entraineur", "benevole"];
const STATUTS: StatutCotisation[] = ["paye", "partiel", "impaye"];
const TYPES_LICENCE: TypeLicence[] = ["competition", "traditionnelle", "decouverte", "entreprise", "para"];
const LICENCE_VIDE: Licence = { numero_licence_ffbad: "", type_licence: null, certificat_medical_valide: false };

export default function AdminMembres() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [licenceForm, setLicenceForm] = useState<Licence>(LICENCE_VIDE);
  const [savingLicence, setSavingLicence] = useState(false);
  const saison = getSaisonActuelle();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, role_club, cotisations(statut, saison), licences(*)")
      .order("nom");
    setMembres((data as Membre[]) ?? []);
    setLoading(false);
  }

  function toggleExpand(m: Membre) {
    if (expandedId === m.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(m.id);
    setLicenceForm(m.licences[0] ?? LICENCE_VIDE);
  }

  async function handleSaveLicence(e: React.FormEvent, profileId: string) {
    e.preventDefault();
    setSavingLicence(true);
    const { error } = await supabase.from("licences").upsert(
      {
        profile_id: profileId,
        numero_licence_ffbad: licenceForm.numero_licence_ffbad || null,
        type_licence: licenceForm.type_licence || null,
        certificat_medical_valide: licenceForm.certificat_medical_valide,
      },
      { onConflict: "profile_id" }
    );
    setSavingLicence(false);
    if (!error) {
      flash(profileId);
      setMembres((rows) =>
        rows.map((r) => (r.id === profileId ? { ...r, licences: [licenceForm] } : r))
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  function flash(id: string) {
    setSavedId(id);
    setTimeout(() => setSavedId((current) => (current === id ? null : current)), 1500);
  }

  async function updateRole(id: string, role_club: RoleClub) {
    setMembres((rows) => rows.map((m) => (m.id === id ? { ...m, role_club } : m)));
    const { error } = await supabase.from("profiles").update({ role_club }).eq("id", id);
    if (!error) flash(id);
  }

  async function updateCotisation(id: string, statut: StatutCotisation) {
    setMembres((rows) =>
      rows.map((m) =>
        m.id === id
          ? {
              ...m,
              cotisations: [
                ...m.cotisations.filter((c) => c.saison !== saison),
                { statut, saison },
              ],
            }
          : m
      )
    );
    const { error } = await supabase
      .from("cotisations")
      .upsert({ profile_id: id, saison, statut }, { onConflict: "profile_id,saison" });
    if (!error) flash(id);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return membres;
    return membres.filter((m) =>
      `${m.prenom} ${m.nom} ${m.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [membres, search]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-ink">Membres</h2>
        <input
          type="text"
          placeholder="Rechercher un membre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
      </div>

      <p className="mt-3 text-xs text-ink/50">
        Passer un membre en « bureau » n&apos;accorde pas automatiquement les droits admin — cela
        se fait via la table <span className="font-mono">bureau_postes</span>.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-ink/60">Chargement…</p>
      ) : (
        <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {filtered.map((m) => {
            const cotisation = m.cotisations.find((c) => c.saison === saison);
            return (
              <div key={m.id}>
                <div className="grid gap-3 py-4 sm:grid-cols-[1fr_160px_160px_60px_80px] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.prenom} {m.nom}</p>
                    {m.email && <p className="text-sm text-ink/55">{m.email}</p>}
                  </div>
                  <select
                    value={m.role_club}
                    onChange={(e) => updateRole(m.id, e.target.value as RoleClub)}
                    className="rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <select
                    value={cotisation?.statut ?? "impaye"}
                    onChange={(e) => updateCotisation(m.id, e.target.value as StatutCotisation)}
                    className="rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                  >
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-red-deep">
                    {savedId === m.id ? "Enregistré" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(m)}
                    className="text-xs font-semibold text-ink/50 underline decoration-ink/20 underline-offset-4 hover:text-ink"
                  >
                    {expandedId === m.id ? "Fermer" : "Licence"}
                  </button>
                </div>

                {expandedId === m.id && (
                  <form
                    onSubmit={(e) => handleSaveLicence(e, m.id)}
                    className="mb-4 flex flex-wrap items-end gap-3 rounded-sm bg-ink/3 p-4"
                  >
                    <input
                      type="text"
                      placeholder="N° de licence FFBaD"
                      value={licenceForm.numero_licence_ffbad ?? ""}
                      onChange={(e) =>
                        setLicenceForm((f) => ({ ...f, numero_licence_ffbad: e.target.value }))
                      }
                      className="rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                    />
                    <select
                      value={licenceForm.type_licence ?? ""}
                      onChange={(e) =>
                        setLicenceForm((f) => ({
                          ...f,
                          type_licence: (e.target.value || null) as TypeLicence | null,
                        }))
                      }
                      className="rounded-sm border border-ink/15 px-2 py-1.5 text-sm"
                    >
                      <option value="">Type de licence</option>
                      {TYPES_LICENCE.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-ink/70">
                      <input
                        type="checkbox"
                        checked={licenceForm.certificat_medical_valide}
                        onChange={(e) =>
                          setLicenceForm((f) => ({
                            ...f,
                            certificat_medical_valide: e.target.checked,
                          }))
                        }
                      />
                      Certificat médical valide
                    </label>
                    <button
                      type="submit"
                      disabled={savingLicence}
                      className="rounded-sm bg-ink px-4 py-1.5 text-xs font-semibold text-feather disabled:opacity-50"
                    >
                      {savingLicence ? "..." : "Enregistrer"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-sm text-ink/60">Aucun membre trouvé.</p>}
        </div>
      )}
    </div>
  );
}
