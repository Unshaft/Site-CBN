import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-ink text-feather">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.jpg"
              alt="Club de Badminton de Nice"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full bg-white object-cover"
            />
            <span className="font-display text-lg font-bold">CBN</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-feather/60">
            Club de Badminton de Nice — jouer, progresser et se retrouver,
            toute la saison.
          </p>
        </div>

        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-red">
            Club
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-feather/70">
            <li><Link href="/vie-du-club" className="hover:text-feather">Vie du club</Link></li>
            <li><Link href="/infos-pratiques" className="hover:text-feather">Infos pratiques</Link></li>
            <li><Link href="/creneaux" className="hover:text-feather">Créneaux</Link></li>
            <li><Link href="/espace-membre" className="hover:text-feather">Espace membre</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-red">
            Pratique
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-feather/70">
            <li>8 salles réparties à Nice</li>
            <li>
              <a href="mailto:contact@cbn06.fr" className="hover:text-feather">
                contact@cbn06.fr
              </a>
            </li>
            <li>
              <a href="tel:+33769593990" className="hover:text-feather">
                07 69 59 39 90
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-red">
            Rejoindre
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-feather/70">
            <li>
              <a
                href="https://wa.me/33000000000"
                target="_blank"
                rel="noreferrer"
                className="hover:text-feather"
              >
                Groupe WhatsApp du club
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-feather">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-feather/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-feather/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Club de Badminton de Nice. Tous droits réservés.</p>
          <p className="font-mono">FFBaD · Ligue PACA</p>
        </div>
      </div>
    </footer>
  );
}
