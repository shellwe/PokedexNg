import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map } from 'rxjs';

import { PokemonSpecies } from '../models/pokemon-species';
import { PokemonSpeciesApi } from '../models/pokemon-species-api';
import { PokemonSpeciesResponse } from '../models/pokemon-species-response';
import { PokemonTypeMembersApi } from '../models/pokemon-type-members-api';
import { PokemonGenerationMembersApi } from '../models/pokemon-generation-members-api';
import { PokemonGenerationListApi } from '../models/pokemon-generation-list-api';
import { PokemonGeneration } from '../models/pokemon-generation';
import { extractIdFromUrl } from '../utils/pokeapi.util';

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

    // Selected type/generation filters, plus a cache of every type/generation
    // we've already fetched so re-selecting one is free (no repeat HTTP call).
    private readonly _selectedType = signal<string | null>(null);
    private readonly _selectedGeneration = signal<number | null>(null);
    private readonly _typeMembers = signal<ReadonlyMap<string, ReadonlySet<string>>>(new Map());
    private readonly _generationMembers = signal<ReadonlyMap<number, ReadonlySet<string>>>(new Map());
    private readonly _typeLoading = signal(false);
    private readonly _generationLoading = signal(false);

    // The list of generations itself, fetched once from the API so a new
    // generation shows up automatically instead of needing a code change.
    private readonly _generations = signal<PokemonGeneration[]>([]);
    private readonly _generationsLoading = signal(false);

    // ---------------------------------
    // Readonly State
    // ---------------------------------

    readonly pokemon = this._pokemon.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly searchText = this._searchText.asReadonly();
    readonly currentPage = this._currentPage.asReadonly();
    readonly pageSize = this._pageSize.asReadonly();
    readonly selectedType = this._selectedType.asReadonly();
    readonly selectedGeneration = this._selectedGeneration.asReadonly();
    readonly typeLoading = this._typeLoading.asReadonly();
    readonly generationLoading = this._generationLoading.asReadonly();
    readonly generations = this._generations.asReadonly();
    readonly generationsLoading = this._generationsLoading.asReadonly();

    // ---------------------------------
    // Computed State
    // ---------------------------------

    readonly filteredPokemon = computed(() => {
        const search = this._searchText().trim().toLowerCase();
        const selectedType = this._selectedType();
        const selectedGeneration = this._selectedGeneration();

        // If a type/generation is selected but its member list hasn't arrived
        // yet, show nothing rather than a flash of the unfiltered list.
        const typeMembers = selectedType ? this._typeMembers().get(selectedType) : null;
        if (selectedType && !typeMembers) {
            return [];
        }

        const generationMembers = selectedGeneration
            ? this._generationMembers().get(selectedGeneration)
            : null;
        if (selectedGeneration && !generationMembers) {
            return [];
        }

        return this._pokemon().filter((pokemon) => {
            if (search && !pokemon.name.includes(search)) {
                return false;
            }

            if (typeMembers && !typeMembers.has(pokemon.name)) {
                return false;
            }

            if (generationMembers && !generationMembers.has(pokemon.name)) {
                return false;
            }

            return true;
        });
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

    loadGenerations(): void {
        if (this._generations().length > 0) {
            return;
        }

        this._generationsLoading.set(true);

        this.http
            .get<PokemonGenerationListApi>('https://pokeapi.co/api/v2/generation?limit=100')
            .pipe(
                map((response) =>
                    response.results
                        .map((entry) => this.mapGeneration(entry))
                        .sort((a, b) => a.id - b.id)
                ),
                finalize(() => this._generationsLoading.set(false))
            )
            .subscribe({
                next: (generations) => this._generations.set(generations),
                error: () => this._error.set('Unable to load generations.'),
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

    setSelectedType(type: string | null): void {
        this._currentPage.set(0);
        this._selectedType.set(type);

        if (type && !this._typeMembers().has(type)) {
            this.loadTypeMembers(type);
        }
    }

    setSelectedGeneration(generationId: number | null): void {
        this._currentPage.set(0);
        this._selectedGeneration.set(generationId);

        if (generationId !== null && !this._generationMembers().has(generationId)) {
            this.loadGenerationMembers(generationId);
        }
    }

    // ---------------------------------
    // Private Methods
    // ---------------------------------

    private loadTypeMembers(type: string): void {
        this._typeLoading.set(true);

        this.http
            .get<PokemonTypeMembersApi>(`https://pokeapi.co/api/v2/type/${type}`)
            .pipe(
                map((response) => new Set(response.pokemon.map((entry) => entry.pokemon.name))),
                finalize(() => this._typeLoading.set(false))
            )
            .subscribe({
                next: (members) => {
                    const next = new Map(this._typeMembers());
                    next.set(type, members);
                    this._typeMembers.set(next);
                },
                error: () => this._error.set(`Unable to load ${type}-type Pokémon.`),
            });
    }

    private loadGenerationMembers(generationId: number): void {
        this._generationLoading.set(true);

        this.http
            .get<PokemonGenerationMembersApi>(
                `https://pokeapi.co/api/v2/generation/${generationId}`
            )
            .pipe(
                map(
                    (response) =>
                        new Set(response.pokemon_species.map((entry) => entry.name))
                ),
                finalize(() => this._generationLoading.set(false))
            )
            .subscribe({
                next: (members) => {
                    const next = new Map(this._generationMembers());
                    next.set(generationId, members);
                    this._generationMembers.set(next);
                },
                error: () => this._error.set(`Unable to load generation ${generationId} Pokémon.`),
            });
    }

    private mapPokemonSpecies(apiPokemon: PokemonSpeciesApi): PokemonSpecies {
        return {
            id: extractIdFromUrl(apiPokemon.url),
            name: apiPokemon.name,
            url: apiPokemon.url,
        };
    }

    private mapGeneration(entry: { name: string; url: string }): PokemonGeneration {
        // PokeAPI names generations like "generation-i", "generation-ii", etc.
        const romanNumeral = entry.name.split('-')[1] ?? '';

        return {
            id: extractIdFromUrl(entry.url),
            label: `Generation ${romanNumeral.toUpperCase()}`,
        };
    }
}