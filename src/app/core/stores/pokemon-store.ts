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
    // ---------------------------------
    // Dependencies
    // ---------------------------------

    private readonly http = inject(HttpClient);

    // ---------------------------------
    // Writable State
    // ---------------------------------

    private readonly _pokemon = signal<PokemonSpecies[]>([]);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);
    private readonly _searchText = signal('');
    private readonly _currentPage = signal(0);
    private readonly _pageSize = signal(20);

    // ---------------------------------
    // Readonly State
    // ---------------------------------

    readonly pokemon = this._pokemon.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly searchText = this._searchText.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly pageSize = this._pageSize.asReadonly();

    // ---------------------------------
    // Computed State
    // ---------------------------------

    readonly filteredPokemon = computed(() => {
        const search = this._searchText().trim().toLowerCase();

        if (!search) {
            return this._pokemon();
        }

        return this._pokemon().filter((pokemon) =>
            pokemon.name.includes(search)
        );
    });

    readonly pagedPokemon = computed(() => {
        const start = this._currentPage() * this._pageSize();
        const end = start + this._pageSize();

        return this.filteredPokemon().slice(start, end);
    });

    readonly totalFilteredPokemon = computed(() =>
        this.filteredPokemon().length
    );

    // ---------------------------------
    // Public Methods
    // ---------------------------------

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

    updatePagination(pageIndex: number, pageSize: number): void {
        this._currentPage.set(pageIndex);
        this._pageSize.set(pageSize);
    }

    // ---------------------------------
    // Private Methods
    // ---------------------------------

    private mapPokemonSpecies(apiPokemon: PokemonSpeciesApi): PokemonSpecies {
        return {
            id: this.extractPokemonId(apiPokemon.url),
            name: apiPokemon.name,
            url: apiPokemon.url,
        };
    }

    private extractPokemonId(url: string): number {
        const segments = url.split('/').filter(Boolean);
        const id = segments.pop();

        return Number(id);
    }
}