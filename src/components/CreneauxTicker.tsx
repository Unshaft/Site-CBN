"use client";

import { useEffect, useRef, useState } from "react";

export type Slot = {
  salle: string;
  jour: string;
  horaire: string;
  niveau: string;
};

export default function CreneauxTicker({ slots }: { slots: Slot[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current || slots.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slots.length);
    }, 3800);
    return () => clearInterval(id);
  }, [paused, slots.length]);

  if (slots.length === 0) return null;

  const current = slots[index];

  return (
    <div
      className="mt-16 max-w-md rounded-sm border border-feather/15 bg-feather/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between border-b border-feather/15 px-6 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-feather/50">
          Créneaux de la semaine
        </p>
        <p className="font-mono text-[11px] text-feather/40">
          {index + 1} / {slots.length}
        </p>
      </div>

      <div
        aria-live="polite"
        className="px-6 py-5"
      >
        <p className="font-mono text-lg text-feather">
          {current.jour} · {current.horaire}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-red">{current.salle}</p>
        <p className="mt-1 text-xs text-feather/55">{current.niveau}</p>
      </div>

      <div className="flex items-center justify-between border-t border-feather/15 px-6 py-3">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + slots.length) % slots.length)}
          className="text-xs font-semibold uppercase tracking-wide text-feather/60 hover:text-feather"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % slots.length)}
          className="text-xs font-semibold uppercase tracking-wide text-feather/60 hover:text-feather"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
