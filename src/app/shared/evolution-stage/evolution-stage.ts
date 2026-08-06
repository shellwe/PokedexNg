import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PokemonEvolutionStage } from '../../core/models/pokemon-evolution-stage';

@Component({
  selector: 'app-evolution-stage',
  imports: [RouterLink, EvolutionStage],
  templateUrl: './evolution-stage.html',
  styleUrl: './evolution-stage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionStage {
  readonly stage = input.required<PokemonEvolutionStage>();
}
