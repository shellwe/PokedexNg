export interface PokemonSpeciesDetailApi {
  evolution_chain: { url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
}
