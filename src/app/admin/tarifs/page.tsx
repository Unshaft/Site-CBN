"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TarifForm, { type TarifRow } from "@/components/admin/TarifForm";

export default function AdminTarifs() {
  const [rows, setRows] = useState<TarifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TarifRow | null | "new">(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("tarifs")
      .select("id, type, label, montant, detail, ordre")
      .order("ordre");
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce tarif ?")) return;
    await supabase.from("tarifs").delete().eq("id", id);
    load();
  }

  const formules = rows.filter((r) => r.type === "formule");
  const reductions = rows.filter((r) => r.type === "reduction");
  const nextOrdre = rows.length ? Math.max(...rows.map((r) => r.ordre)) + 1 : 1;

  function Section({ title, items }: { title: string; items: TarifRow[] }) {
    return (
      <div className="mt-10">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">{title}</h3>
        <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {items.map((row) => (
            <div key={row.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <p className="text-sm font-semibold text-ink">{row.label}</p>
                {row.detail && <p className="text-sm text-ink/55">{row.detail}</p>}
              </div>
              <p className="font-mono text-sm font-semibold text-ink">{row.montant}</p>
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
          {items.length === 0 && <p className="py-4 text-sm text-ink/60">Aucun tarif.</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Tarifs</h2>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-feather hover:bg-ink-deep"
          >
            + Ajouter un tarif
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="mt-6">
          <TarifForm
            initial={editing === "new" ? undefined : editing}
            nextOrdre={nextOrdre}
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
        <>
          <Section title="Formules" items={formules} />
          <Section title="Réductions" items={reductions} />
        </>
      )}
    </div>
  );
}
