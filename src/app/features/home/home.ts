import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PokemonStore } from '../../core/stores/pokemon-store';
import { POKEMON_TYPES } from '../../core/constants/pokemon-types';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { PokemonCard } from '../../shared/pokemon-card/pokemon-card';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    PokemonCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  readonly pokemonStore = inject(PokemonStore);

  readonly pokemonTypes = POKEMON_TYPES;

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly searchText = toSignal(
    this.searchControl.valueChanges,
    {
      initialValue: '',
    }
  );

  private readonly syncSearch = effect(() => {
    this.pokemonStore.setSearchText(this.searchText());
  });

  onPageChange(event: PageEvent): void {
    this.pokemonStore.updatePagination(
      event.pageIndex,
      event.pageSize
    );
  }

  onTypeChange(type: string | null): void {
    this.pokemonStore.setSelectedType(type);
  }

  onGenerationChange(generationId: number | null): void {
    this.pokemonStore.setSelectedGeneration(generationId);
  }

  ngOnInit(): void {
    this.pokemonStore.loadPokemon();
    this.pokemonStore.loadGenerations();
  }
}