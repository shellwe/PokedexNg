import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map } from 'rxjs';

import { PokemonSpecies } from '../models/pokemon-species';
import { PokemonSpeciesApi } from '../models/pokemon-species-api';
import { PokemonSpeciesResponse } from '../models/pokemon-species-response';

@Injectable({
  providedIn: 'root',
})
export class PokemonStore {
  private readonly http = inject(HttpClient);

  private readonly _pokemon = signal<PokemonSpecies[]>([]);
  readonly pokemon = this._pokemon.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _searchText = signal('');
  readonly searchText = this._searchText.asReadonly();

  private readonly _currentPage = signal(0);
  readonly currentPage = this._currentPage.asReadonly();

  private readonly _pageSize = signal(20);
  readonly pageSize = this._pageSize.asReadonly();

  readonly filteredPokemon = computed(() => {
    const search = this._searchText().trim().toLowerCase();

    if (!search) {
      return this._pokemon();
    }

    return this._pokemon().filter((pokemon) =>
      pokemon.name.includes(search)
    );
  });

  loadPokemon(): void {
    if (this._pokemon().length > 0) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<PokemonSpeciesResponse>(
        'https://pokeapi.co/api/v2/pokemon-species?limit=2000'
      )
      .pipe(
        map((response) =>
          response.results.map((pokemon) => this.mapPokemonSpecies(pokemon))
        ),
        finalize(() => this._loading.set(false))
      )
      .subscribe({
        next: (pokemon) => this._pokemon.set(pokemon),
        error: () => this._error.set('Unable to load Pokémon.'),
      });
  }

  setSearchText(searchText: string): void {
    this._searchText.set(searchText.trim());
    this._currentPage.set(0);
  }

  private mapPokemonSpecies(apiPokemon: PokemonSpeciesApi): PokemonSpecies {
    return {
      id: Number(apiPokemon.url.split('/').filter(Boolean).pop()),
      name: apiPokemon.name,
      url: apiPokemon.url,
    };
  }
}