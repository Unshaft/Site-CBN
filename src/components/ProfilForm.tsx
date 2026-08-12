"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Profil = {
  id: string;
  user_id: string | null;
  claim_code: string | null;
  prenom: string;
  nom: string;
  date_naissance: string | null;
  sexe: string | null;
  telephone: string | null;
  adresse: string | null;
  contact_urgence_nom: string | null;
  contact_urgence_telephone: string | null;
  consentement_image: boolean;
};

const CHAMPS_CLES: (keyof Profil)[] = [
  "prenom",
  "nom",
  "date_naissance",
  "telephone",
  "adresse",
  "contact_urgence_telephone",
];

const SELECT_COLUMNS =
  "id, user_id, claim_code, prenom, nom, date_naissance, sexe, telephone, adresse, contact_urgence_nom, contact_urgence_telephone, consentement_image";

function genererCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O/1/I
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return code;
}

function ProfilCard({ profil, onSaved }: { profil: Profil; onSaved: (p: Profil) => void }) {
  const [form, setForm] = useState(profil);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  function update<K extends keyof Profil>(key: K, value: Profil[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        date_naissance: form.date_naissance || null,
        sexe: form.sexe || null,
        telephone: form.telephone?.trim() || null,
        adresse: form.adresse?.trim() || null,
        contact_urgence_nom: form.contact_urgence_nom?.trim() || null,
        contact_urgence_telephone: form.contact_urgence_telephone?.trim() || null,
        consentement_image: form.consentement_image,
      })
      .eq("id", form.id);

    setSaving(false);
    setMessage(error ? error.message : "Profil enregistré.");
    if (!error) onSaved(form);
  }

  async function handleGenererCode() {
    setGeneratingCode(true);
    const code = genererCode();
    const { error } = await supabase
      .from("profiles")
      .update({ claim_code: code })
      .eq("id", form.id);
    setGeneratingCode(false);
    if (!error) {
      update("claim_code", code);
      onSaved({ ...form, claim_code: code });
    }
  }

  const rempli = CHAMPS_CLES.filter((k) => !!form[k]).length;
  const estEnfant = form.user_id === null;

  return (
    <div className="mt-6 rounded-sm border border-ink/10 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          {estEnfant ? `Profil de ${form.prenom || "l'enfant"}` : "Ma fiche licencié"}
        </h2>
        <p className="font-mono text-xs text-ink/45">{rempli} / {CHAMPS_CLES.length} champs</p>
      </div>

      {estEnfant && (
        <div className="mt-3 rounded-sm bg-red-soft/40 px-4 py-3 text-sm text-ink/70">
          {form.claim_code ? (
            <>
              Code de rattachement :{" "}
              <span className="font-mono font-semibold text-ink">{form.claim_code}</span>
              <br />
              Donne ce code à ton enfant : il pourra créer son propre compte
              et récupérer ce profil en le saisissant à l'inscription.
            </>
          ) : (
            <button
              type="button"
              onClick={handleGenererCode}
              disabled={generatingCode}
              className="font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
            >
              {generatingCode ? "..." : "Générer un code de rattachement"}
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-sm text-ink/60">
        Ces infos servent au club pour {estEnfant ? "le" : "te"} contacter et
        suivre les effectifs — la cotisation et le numéro de licence restent
        gérés par le bureau une fois le dossier MyFFBaD validé.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Prénom"
            value={form.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">
              Date de naissance
            </span>
            <input
              type="date"
              value={form.date_naissance ?? ""}
              onChange={(e) => update("date_naissance", e.target.value)}
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">
              Sexe
            </span>
            <select
              value={form.sexe ?? ""}
              onChange={(e) => update("sexe", e.target.value)}
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            >
              <option value="">Préfère ne pas répondre</option>
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </label>
        </div>

        <input
          type="tel"
          placeholder="Téléphone"
          value={form.telephone ?? ""}
          onChange={(e) => update("telephone", e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Adresse"
          value={form.adresse ?? ""}
          onChange={(e) => update("adresse", e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink/45">
            Contact en cas d'urgence
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nom du contact"
              value={form.contact_urgence_nom ?? ""}
              onChange={(e) => update("contact_urgence_nom", e.target.value)}
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            />
            <input
              type="tel"
              placeholder="Téléphone du contact"
              value={form.contact_urgence_telephone ?? ""}
              onChange={(e) => update("contact_urgence_telephone", e.target.value)}
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.consentement_image}
            onChange={(e) => update("consentement_image", e.target.checked)}
            className="mt-0.5"
          />
          J'autorise le club à utiliser des photos/vidéos {estEnfant ? "de l'enfant" : "de moi"}{" "}
          prises lors des entraînements et événements (site, réseaux sociaux).
        </label>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          {saving ? "..." : "Enregistrer"}
        </button>
        {message && <p className="text-sm text-ink/70">{message}</p>}
      </form>
    </div>
  );
}

function AjouterEnfant({ userId, onCreated }: { userId: string; onCreated: (p: Profil) => void }) {
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: profil, error: insertError } = await supabase
      .from("profiles")
      .insert({ prenom: prenom.trim(), nom: nom.trim(), date_naissance: dateNaissance || null })
      .select(SELECT_COLUMNS)
      .single();

    if (insertError || !profil) {
      setSaving(false);
      setError(insertError?.message ?? "Impossible de créer le profil.");
      return;
    }

    const { error: guardianError } = await supabase
      .from("profile_guardians")
      .insert({ parent_user_id: userId, profile_id: profil.id });

    setSaving(false);

    if (guardianError) {
      setError(guardianError.message);
      return;
    }

    onCreated(profil as Profil);
    setOpen(false);
    setPrenom("");
    setNom("");
    setDateNaissance("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
      >
        + Ajouter le profil de mon enfant
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-ink/10 p-6">
      <h3 className="font-display text-base font-bold text-ink">Profil de mon enfant</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">
          Date de naissance
        </span>
        <input
          type="date"
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm sm:w-1/2"
        />
      </label>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          {saving ? "..." : "Créer ce profil"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink/50 underline decoration-ink/20 underline-offset-4"
        >
          Annuler
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-deep">{error}</p>}
    </form>
  );
}

export default function ProfilForm() {
  const [user, setUser] = useState<User | null>(null);
  const [profils, setProfils] = useState<Profil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) await loadProfils();
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfils();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfils() {
    const { data } = await supabase.from("profiles").select(SELECT_COLUMNS);
    if (data) {
      const score = (p: { user_id: string | null }) => (p.user_id ? 0 : 1);
      const sorted = [...data].sort((a, b) => score(a) - score(b));
      setProfils(sorted as Profil[]);
    }
  }

  function handleSaved(updated: Profil) {
    setProfils((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleCreated(created: Profil) {
    setProfils((list) => [...list, created]);
  }

  if (loading || !user) return null;

  return (
    <div>
      {profils.map((p) => (
        <ProfilCard key={p.id} profil={p} onSaved={handleSaved} />
      ))}
      <AjouterEnfant userId={user.id} onCreated={handleCreated} />
    </div>
  );
}
