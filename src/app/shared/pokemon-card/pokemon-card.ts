import { Component, input, computed } from '@angular/core';

import { PokemonSpecies } from '../../core/models/pokemon-species';
import { getOfficialArtworkUrl } from '../../core/utils/pokeapi.util';

import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-pokemon-card',
  imports: [MatCardModule, RouterLink ],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss',
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonSpecies>();
  readonly artworkUrl = computed(() => getOfficialArtworkUrl(this.pokemon().id));
}
