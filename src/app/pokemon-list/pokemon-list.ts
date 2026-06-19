import { ChangeDetectionStrategy, Component, inject,  OnInit, } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FormControl, ReactiveFormsModule } from '@angular/forms';

import {  debounceTime,  distinctUntilChanged,  map,  startWith} from 'rxjs/operators';

import { combineLatest } from 'rxjs';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AsyncPipe } from '@angular/common';

import { PokemonCard } from '../pokemon-card/pokemon-card';

import { PokemonItem, PokemonResponse  } from '../pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  imports: [AsyncPipe, ReactiveFormsModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, PokemonCard],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonList implements OnInit {
  private readonly http = inject(HttpClient);

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly pageSize = 24;

  pageIndex = 0;

  pokemon: PokemonItem[] = [];

  filteredPokemon: PokemonItem[] = [];

  pagedPokemon: PokemonItem[] = [];

  ngOnInit(): void {
    this.http
      .get<PokemonResponse>('assets/pokemon.json')
      .pipe(
        map(data =>
          data.results.map((pokemon: any) => ({
            name: pokemon.name,
            id: Number(
              pokemon.url
                .split('/')
                .filter(Boolean)
                .pop()
            ),
          }))
        )
      )
      .subscribe(pokemon => {
        this.pokemon = pokemon;
        this.filteredPokemon = pokemon;
        this.updatePage();
      });

    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe(search => {
        const value = search.toLowerCase().trim();

        this.filteredPokemon = this.pokemon.filter(p =>
          p.name.includes(value)
        );

        this.pageIndex = 0;

        this.updatePage();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.updatePage();
  }

  private updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.pagedPokemon = this.filteredPokemon.slice(start, end);
  }

  trackByPokemon(_: number, pokemon: PokemonItem): number {
    return pokemon.id;
  }

}
