import { TestBed } from '@angular/core/testing';

import { PokemonStore } from './pokemon-store';

describe('PokemonStore', () => {
  let service: PokemonStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
