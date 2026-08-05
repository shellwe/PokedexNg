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
}
