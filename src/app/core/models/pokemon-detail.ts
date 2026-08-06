import { PokemonDetailApi } from './pokemon-detail-api';
import { getOfficialArtworkUrl } from '../utils/pokeapi.util';

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  heightInMeters: number;
  weightInKilograms: number;
  types: string[];
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: string; base: number }[];
}

export function mapPokemonDetail(api: PokemonDetailApi): PokemonDetail {
  return {
    id: api.id,
    name: api.name,
    imageUrl:
      api.sprites.other?.['official-artwork']?.front_default ??
      getOfficialArtworkUrl(api.id),
    // PokeAPI reports height in decimetres and weight in hectograms.
    heightInMeters: api.height / 10,
    weightInKilograms: api.weight / 10,
    types: api.types.map((entry) => entry.type.name),
    abilities: api.abilities.map((entry) => ({
      name: entry.ability.name,
      isHidden: entry.is_hidden,
    })),
    stats: api.stats.map((entry) => ({
      name: entry.stat.name,
      base: entry.base_stat,
    })),
  };
}
