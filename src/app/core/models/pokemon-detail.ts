import { PokemonDetailApi } from './pokemon-detail-api';
import { getOfficialArtworkUrl } from '../utils/pokeapi.util';

export interface PokemonLevelUpMove {
  name: string;
  url: string;
  level: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  heightInMeters: number;
  weightInKilograms: number;
  types: string[];
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: string; base: number }[];
  levelUpMoves: PokemonLevelUpMove[];
  games: string[];
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
    levelUpMoves: mapLevelUpMoves(api.moves),
    games: api.game_indices.map((entry) => formatDashedName(entry.version.name)),
  };
}

function mapLevelUpMoves(moves: PokemonDetailApi['moves']): PokemonLevelUpMove[] {
  const levelUpMoves: PokemonLevelUpMove[] = [];

  for (const entry of moves) {
    const levelUpDetail = entry.version_group_details.find(
      (detail) => detail.move_learn_method.name === 'level-up'
    );

    if (levelUpDetail) {
      levelUpMoves.push({
        name: entry.move.name,
        url: entry.move.url,
        level: levelUpDetail.level_learned_at,
      });
    }
  }

  return levelUpMoves.sort((a, b) => a.level - b.level);
}

function formatDashedName(name: string): string {
  return name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
