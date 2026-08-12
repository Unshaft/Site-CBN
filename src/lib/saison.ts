// Format "AAAA-AAAA", tri lexicographique fiable (cf. stats_licencies).
// Bascule de saison au 1er juillet.
export function getSaisonActuelle(): string {
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
}
