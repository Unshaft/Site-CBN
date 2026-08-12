"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/vie-du-club", label: "Vie du club" },
  { href: "/infos-pratiques", label: "Infos pratiques" },
  { href: "/creneaux", label: "Créneaux" },
  { href: "/espace-membre", label: "Espace membre" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-feather/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpg"
            alt="Club de Badminton de Nice"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            priority
          />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            CBN<span className="text-red-deep">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-wide text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/rejoindre"
            className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep"
          >
            Rejoindre le club
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-ink transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div className="court-rule" />

      {open && (
        <nav className="flex flex-col gap-1 border-b border-ink/10 bg-feather px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-base font-medium text-ink/80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/rejoindre"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-sm bg-ink px-5 py-3 text-sm font-semibold text-feather"
          >
            Rejoindre le club
          </Link>
        </nav>
      )}
    </header>
  );
}
