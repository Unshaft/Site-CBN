"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/actualites";
import ActualiteForm, { type ActualiteRow } from "@/components/admin/ActualiteForm";

export default function AdminActualites() {
  const [rows, setRows] = useState<ActualiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ActualiteRow | null | "new">(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("actualites")
      .select("id, titre, categorie, extrait, date_debut, date_fin")
      .order("date_debut", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette actualité ?")) return;
    await supabase.from("actualites").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Actualités</h2>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-feather hover:bg-ink-deep"
          >
            + Publier une actu
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="mt-6">
          <ActualiteForm
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-ink/60">Chargement…</p>
      ) : (
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-3 py-6 sm:grid-cols-[140px_1fr_auto]">
              <div>
                <p className="font-mono text-xs text-ink/45">
                  {formatDate(row.date_debut, row.date_fin, true)}
                </p>
                <span className="mt-2 inline-block rounded-sm bg-red-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                  {row.categorie}
                </span>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-ink">{row.titre}</p>
                <p className="mt-1 text-sm text-ink/65">{row.extrait}</p>
              </div>
              <div className="flex items-start gap-4 text-sm font-semibold">
                <button onClick={() => setEditing(row)} className="text-ink hover:text-red-deep">
                  Modifier
                </button>
                <button onClick={() => handleDelete(row.id)} className="text-red-deep hover:text-red">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="py-6 text-sm text-ink/60">Aucune actualité publiée.</p>}
        </div>
      )}
    </div>
  );
}
