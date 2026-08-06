export interface PokemonEvolutionChainApi {
  chain: PokemonEvolutionChainLinkApi;
}

export interface PokemonEvolutionChainLinkApi {
  species: { name: string; url: string };
  evolution_details: PokemonEvolutionDetailApi[];
  evolves_to: PokemonEvolutionChainLinkApi[];
}

export interface PokemonEvolutionDetailApi {
  trigger: { name: string } | null;
  min_level: number | null;
  item: { name: string } | null;
}
