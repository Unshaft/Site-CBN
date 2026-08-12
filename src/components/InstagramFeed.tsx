import Image from "next/image";
import { getInstagramPosts } from "@/lib/instagram";

const PROFILE_URL = "https://www.instagram.com/cbn06badminton/"; // TODO: vérifier le pseudo exact du club

export default async function InstagramFeed() {
  const posts = await getInstagramPosts(6);
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-deep">
            Instagram
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            Sur le terrain, en images
          </h2>
        </div>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4 md:block"
        >
          Nous suivre
        </a>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden bg-ink/5"
          >
            <Image
              src={post.imageUrl}
              alt={post.caption?.slice(0, 100) || "Publication Instagram du CBN"}
              fill
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
