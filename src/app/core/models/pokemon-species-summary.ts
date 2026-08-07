import { PokemonSpeciesDetailApi } from './pokemon-species-detail-api';

export interface PokemonSpeciesSummary {
  evolutionChainUrl: string;
  genus: string;
  flavorText: string;
}

export function mapSpeciesSummary(api: PokemonSpeciesDetailApi): PokemonSpeciesSummary {
  const englishGenus = api.genera.find((entry) => entry.language.name === 'en');
  const englishFlavorText = api.flavor_text_entries.find((entry) => entry.language.name === 'en');

  return {
    evolutionChainUrl: api.evolution_chain.url,
    genus: englishGenus?.genus ?? '',
    // Older games hard-wrap flavor text with \n and \f (form feed) characters
    // for their fixed-width text boxes; flatten those into plain spaces.
    flavorText: (englishFlavorText?.flavor_text ?? '').replace(/[\n\f]/g, ' '),
  };
}
