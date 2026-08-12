"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type TarifRow = {
  id: string;
  type: "formule" | "reduction";
  label: string;
  montant: string;
  detail: string | null;
  ordre: number;
};

function empty(nextOrdre: number): Omit<TarifRow, "id"> {
  return { type: "formule", label: "", montant: "", detail: "", ordre: nextOrdre };
}

export default function TarifForm({
  initial,
  nextOrdre,
  onSaved,
  onCancel,
}: {
  initial?: TarifRow;
  nextOrdre: number;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Omit<TarifRow, "id">>(initial ?? empty(nextOrdre));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.label.trim() || !values.montant.trim()) {
      setError("Libellé et montant sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      type: values.type,
      label: values.label.trim(),
      montant: values.montant.trim(),
      detail: values.type === "formule" ? values.detail?.trim() || null : null,
      ordre: values.ordre,
    };

    const { error: dbError } = initial
      ? await supabase.from("tarifs").update(payload).eq("id", initial.id)
      : await supabase.from("tarifs").insert(payload);

    setSaving(false);
    if (dbError) setError(dbError.message);
    else onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-ink/10 p-6">
      <div className="flex gap-6 text-sm">
        {(["formule", "reduction"] as const).map((t) => (
          <label key={t} className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={values.type === t}
              onChange={() => update("type", t)}
            />
            {t === "formule" ? "Formule" : "Réduction"}
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Libellé (ex: Loisir — renouvellement)"
          value={values.label}
          onChange={(e) => update("label", e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          placeholder="Montant (ex: 209 € ou −20 €)"
          value={values.montant}
          onChange={(e) => update("montant", e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
      </div>

      {values.type === "formule" && (
        <input
          type="text"
          placeholder="Détail (ex: Adulte déjà licencié au club)"
          value={values.detail ?? ""}
          onChange={(e) => update("detail", e.target.value)}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
      )}

      <label className="block max-w-[140px]">
        <span className="mb-1 block text-xs uppercase tracking-widest text-ink/45">Ordre</span>
        <input
          type="number"
          value={values.ordre}
          onChange={(e) => update("ordre", Number(e.target.value))}
          className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          {saving ? "..." : initial ? "Enregistrer" : "Ajouter"}
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
