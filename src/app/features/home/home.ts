import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { PokemonStore } from '../../core/stores/pokemon-store';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  readonly pokemonStore = inject(PokemonStore);
  ngOnInit(): void {
    this.pokemonStore.loadPokemon();
  }

  constructor() {
    this.pokemonStore.loadPokemon();
  }
}