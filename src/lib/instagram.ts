type GraphMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

type GraphMedia = {
  id: string;
  caption?: string;
  media_type: GraphMediaType;
  media_url: string;
  permalink: string;
};

export type InstagramPost = {
  id: string;
  caption?: string;
  imageUrl: string;
  permalink: string;
};

const FIELDS = "id,caption,media_type,media_url,permalink";

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=${limit}&access_token=${token}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const { data }: { data: GraphMedia[] } = await res.json();

  return data
    .filter((post) => post.media_type !== "VIDEO")
    .map((post) => ({
      id: post.id,
      caption: post.caption,
      imageUrl: post.media_url,
      permalink: post.permalink,
    }));
}
