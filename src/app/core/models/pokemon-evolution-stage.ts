import {
  PokemonEvolutionChainApi,
  PokemonEvolutionChainLinkApi,
  PokemonEvolutionDetailApi,
} from './pokemon-evolution-chain-api';
import { extractIdFromUrl, getOfficialArtworkUrl } from '../utils/pokeapi.util';

export interface PokemonEvolutionStage {
  id: number;
  name: string;
  imageUrl: string;
  // How this stage is reached from its parent; null for the base stage.
  trigger: string | null;
  evolvesTo: PokemonEvolutionStage[];
}

export function mapEvolutionChain(api: PokemonEvolutionChainApi): PokemonEvolutionStage {
  return mapLink(api.chain, null);
}

function mapLink(
  link: PokemonEvolutionChainLinkApi,
  trigger: string | null
): PokemonEvolutionStage {
  const id = extractIdFromUrl(link.species.url);

  return {
    id,
    name: link.species.name,
    imageUrl: getOfficialArtworkUrl(id),
    trigger,
    evolvesTo: link.evolves_to.map((child) =>
      mapLink(child, describeEvolutionTrigger(child.evolution_details))
    ),
  };
}

function describeEvolutionTrigger(details: PokemonEvolutionDetailApi[]): string {
  const detail = details[0];
  if (!detail) {
    return 'Evolves';
  }

  if (detail.item) {
    return `Use ${detail.item.name.replace('-', ' ')}`;
  }

  if (detail.min_level) {
    // Not showing the specific number: the required level can differ across
    // game versions (see PokemonEvolutionDetailApi), and we only read the
    // first evolution_details entry, so a specific number here would claim
    // more precision than we actually have.
    return 'Level up';
  }

  if (detail.trigger?.name === 'trade') {
    return 'Trade';
  }

  return 'Evolves';
}
