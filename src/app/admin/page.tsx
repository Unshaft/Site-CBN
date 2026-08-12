"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSaisonActuelle } from "@/lib/saison";
import StatBars from "@/components/admin/StatBars";

type Repartition = { label: string; effectif: number }[];

type Stats = {
  total_membres: number;
  par_role_club: Repartition;
  cotisation: { paye: number; partiel: number; impaye: number; sans_ligne: number };
  nb_salles: number;
  nb_creneaux: number;
  bureau_actif: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saison = getSaisonActuelle();
    supabase.rpc("admin_dashboard_stats", { p_saison: saison }).then(({ data, error: rpcError }) => {
      if (rpcError) setError(rpcError.message);
      else setStats(data as Stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-ink/60">Chargement…</p>;
  if (error || !stats) return <p className="text-sm text-ink/60">{error ?? "Aucune donnée."}</p>;

  const cotisationData: Repartition = [
    { label: "À jour", effectif: stats.cotisation.paye },
    { label: "Partielle", effectif: stats.cotisation.partiel },
    { label: "Impayée", effectif: stats.cotisation.impaye },
    { label: "Sans ligne", effectif: stats.cotisation.sans_ligne },
  ];

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-4">
        {[
          { label: "Membres", value: stats.total_membres },
          { label: "Salles", value: stats.nb_salles },
          { label: "Créneaux", value: stats.nb_creneaux },
          { label: "Bureau actif", value: stats.bureau_actif },
        ].map((s) => (
          <div key={s.label} className="border-l-2 border-red pl-4">
            <p className="font-mono text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <StatBars title="Cotisation de la saison" data={cotisationData} total={stats.total_membres} />
        <StatBars title="Rôle au club" data={stats.par_role_club} total={stats.total_membres} />
      </div>
    </div>
  );
}
