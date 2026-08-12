"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type ActualiteRow = {
  id: string;
  titre: string;
  categorie: string;
  extrait: string;
  date_debut: string;
  date_fin: string | null;
};

const CATEGORIES = ["Annonce", "Événement", "Convivialité", "Résultat"];

const EMPTY: Omit<ActualiteRow, "id"> = {
  titre: "",
  categorie: "Annonce",
  extrait: "",
  date_debut: new Date().toISOString().slice(0, 10),
  date_fin: null,
};

export default function ActualiteForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: ActualiteRow;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Omit<ActualiteRow, "id">>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.titre.trim() || !values.extrait.trim()) {
      setError("Titre et texte sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      titre: values.titre.trim(),
      categorie: values.categorie,
      extrait: values.extrait.trim(),
      date_debut: values.date_debut,
      date_fin: values.date_fin || null,
    };

    const { error: dbError } = initial
      ? await supabase.from("actualites").update(payload).eq("id", initial.id)
      : await supabase.from("actualites").insert(payload);

    setSaving(false);
    if (dbError) setError(dbError.message);
    else onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-ink/10 p-6">
      <input
        type="text"
        required
        placeholder="Titre"
        value={values.titre}
        onChange={(e) => update("titre", e.target.value)}
        className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">Catégorie</span>
          <select
            value={values.categorie}
            onChange={(e) => update("categorie", e.target.value)}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">Date de début</span>
          <input
            type="date"
            required
            value={values.date_debut}
            onChange={(e) => update("date_debut", e.target.value)}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">
            Date de fin (optionnel)
          </span>
          <input
            type="date"
            value={values.date_fin ?? ""}
            onChange={(e) => update("date_fin", e.target.value || null)}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <textarea
        required
        rows={3}
        placeholder="Texte de l'annonce"
        value={values.extrait}
        onChange={(e) => update("extrait", e.target.value)}
        className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          {saving ? "..." : initial ? "Enregistrer" : "Publier"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-ink/60 hover:text-ink">
            Annuler
          </button>
        )}
        {error && <p className="text-sm text-red-deep">{error}</p>}
      </div>
    </form>
  );
}
