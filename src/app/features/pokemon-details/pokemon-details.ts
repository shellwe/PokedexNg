import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PokemonDetailApi } from '../../core/models/pokemon-detail-api';
import { mapPokemonDetail, PokemonLevelUpMove } from '../../core/models/pokemon-detail';
import { PokemonSpeciesDetailApi } from '../../core/models/pokemon-species-detail-api';
import { mapSpeciesSummary } from '../../core/models/pokemon-species-summary';
import { PokemonEvolutionChainApi } from '../../core/models/pokemon-evolution-chain-api';
import { mapEvolutionChain } from '../../core/models/pokemon-evolution-stage';
import { PokemonMoveDetailApi } from '../../core/models/pokemon-move-detail-api';
import { EvolutionStage } from '../../shared/evolution-stage/evolution-stage';

@Component({
  selector: 'app-pokemon-details',
  imports: [
    RouterLink,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    EvolutionStage,
  ],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetails {
  private readonly http = inject(HttpClient);

  // Bound automatically from the ':name' route param via withComponentInputBinding().
  readonly name = input.required<string>();

  readonly pokemon = httpResource(
    () => `https://pokeapi.co/api/v2/pokemon/${this.name()}`,
    { parse: (raw) => mapPokemonDetail(raw as PokemonDetailApi) }
  );

  // Species detail is where the evolution chain URL, category, and Pokédex
  // description live — a second lookup alongside `pokemon`, not derived from it.
  readonly species = httpResource(
    () => `https://pokeapi.co/api/v2/pokemon-species/${this.name()}`,
    { parse: (raw) => mapSpeciesSummary(raw as PokemonSpeciesDetailApi) }
  );

  // Depends on `species` above: its URL function reads `species.value()`, so
  // this resource stays idle until the species lookup resolves, then fetches
  // automatically once a real URL is available.
  readonly evolutionChain = httpResource(
    () => this.species.value()?.evolutionChainUrl,
    { parse: (raw) => mapEvolutionChain(raw as PokemonEvolutionChainApi) }
  );

  // A move's type isn't included in the pokemon/species payloads above — it
  // lives at its own /move/{name} endpoint. A pokemon can know 20-30+ moves,
  // so we don't fetch all of them up front; instead we cache each type the
  // first time its move is expanded, so re-expanding costs nothing.
  private readonly _moveTypes = signal<ReadonlyMap<string, string>>(new Map());
  private readonly _loadingMoveTypes = signal<ReadonlySet<string>>(new Set());

  readonly moveTypes = this._moveTypes.asReadonly();
  readonly loadingMoveTypes = this._loadingMoveTypes.asReadonly();

  loadMoveType(move: PokemonLevelUpMove): void {
    if (this._moveTypes().has(move.name) || this._loadingMoveTypes().has(move.name)) {
      return;
    }

    this._loadingMoveTypes.update((loading) => new Set(loading).add(move.name));

    this.http
      .get<PokemonMoveDetailApi>(move.url)
      .pipe(
        finalize(() =>
          this._loadingMoveTypes.update((loading) => {
            const next = new Set(loading);
            next.delete(move.name);
            return next;
          })
        )
      )
      .subscribe({
        next: (response) =>
          this._moveTypes.update((types) => new Map(types).set(move.name, response.type.name)),
      });
  }
}
