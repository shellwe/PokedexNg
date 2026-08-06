export function extractIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean);
  return Number(segments.pop());
}

export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
