export interface PokemonDetailApi {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: { name: string; url: string };
  }[];
  abilities: {
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }[];
  stats: {
    base_stat: number;
    stat: { name: string; url: string };
  }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
  game_indices: {
    version: { name: string };
  }[];
}
