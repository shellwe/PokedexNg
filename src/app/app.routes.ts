import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'pokemon/:name',
    loadComponent: () =>
      import('./features/pokemon-details/pokemon-details').then(
        m => m.PokemonDetails
      ),
  },
];
