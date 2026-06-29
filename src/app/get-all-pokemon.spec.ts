import { TestBed } from '@angular/core/testing';

import { GetAllPokemon } from './get-all-pokemon';

describe('GetAllPokemon', () => {
  let service: GetAllPokemon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAllPokemon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
