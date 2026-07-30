import { Component, input, computed } from '@angular/core';

import { PokemonSpecies } from '../../core/models/pokemon-species';

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
  readonly artworkUrl = computed(() =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.pokemon().id}.png`
  );  
}
