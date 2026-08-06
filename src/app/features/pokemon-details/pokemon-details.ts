import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PokemonDetailApi } from '../../core/models/pokemon-detail-api';
import { mapPokemonDetail } from '../../core/models/pokemon-detail';
import { PokemonSpeciesDetailApi } from '../../core/models/pokemon-species-detail-api';
import { PokemonEvolutionChainApi } from '../../core/models/pokemon-evolution-chain-api';
import { mapEvolutionChain } from '../../core/models/pokemon-evolution-stage';
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
  // Bound automatically from the ':name' route param via withComponentInputBinding().
  readonly name = input.required<string>();

  readonly pokemon = httpResource(
    () => `https://pokeapi.co/api/v2/pokemon/${this.name()}`,
    { parse: (raw) => mapPokemonDetail(raw as PokemonDetailApi) }
  );

  // Intermediate lookup: species detail is where the evolution chain URL lives.
  private readonly species = httpResource(
    () => `https://pokeapi.co/api/v2/pokemon-species/${this.name()}`,
    { parse: (raw) => raw as PokemonSpeciesDetailApi }
  );

  // Depends on `species` above: its URL function reads `species.value()`, so
  // this resource stays idle until the species lookup resolves, then fetches
  // automatically once a real URL is available.
  readonly evolutionChain = httpResource(
    () => this.species.value()?.evolution_chain.url,
    { parse: (raw) => mapEvolutionChain(raw as PokemonEvolutionChainApi) }
  );
}
