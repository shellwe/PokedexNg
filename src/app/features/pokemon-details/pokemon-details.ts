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

@Component({
  selector: 'app-pokemon-details',
  imports: [
    RouterLink,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
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
}
