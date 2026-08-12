"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/lib/useAdmin";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/actualites", label: "Actualités" },
  { href: "/admin/tarifs", label: "Tarifs" },
  { href: "/admin/membres", label: "Membres" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (admin.status === "denied") router.replace("/espace-membre");
  }, [admin.status, router]);

  if (admin.status !== "authorized") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">Admin</p>
        <p className="mt-4 text-sm text-ink/60">Vérification des droits…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">Espace bureau</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
        Administration
      </h1>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-ink/10 text-sm font-semibold uppercase tracking-wide">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 pb-3 ${
              pathname === t.href ? "border-b-2 border-red text-ink" : "text-ink/50 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">{children}</div>
    </div>
  );
}
