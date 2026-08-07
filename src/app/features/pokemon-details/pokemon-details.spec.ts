import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PokemonDetails } from './pokemon-details';

const MOCK_RAW_POKEMON = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  sprites: { other: { 'official-artwork': { front_default: 'test.png' } } },
  types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  abilities: [{ ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 }],
  stats: [{ base_stat: 45, stat: { name: 'hp', url: '' } }],
  moves: [
    {
      move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' },
      version_group_details: [
        { level_learned_at: 1, move_learn_method: { name: 'level-up' } },
      ],
    },
    {
      move: { name: 'vine-whip', url: 'https://pokeapi.co/api/v2/move/22/' },
      version_group_details: [
        { level_learned_at: 3, move_learn_method: { name: 'level-up' } },
      ],
    },
  ],
  game_indices: [{ version: { name: 'red' } }, { version: { name: 'blue' } }],
};

const MOCK_RAW_SPECIES = {
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
  genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
  flavor_text_entries: [
    { flavor_text: 'A strange seed was\nplanted on its back.', language: { name: 'en' } },
  ],
};

const MOCK_RAW_EVOLUTION_CHAIN = {
  chain: {
    species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
        evolution_details: [{ trigger: { name: 'level-up' }, min_level: 16, item: null }],
        evolves_to: [],
      },
    ],
  },
};

function flushPokemonDetailRequests(httpMock: HttpTestingController): void {
  httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/bulbasaur').flush(MOCK_RAW_POKEMON);
  httpMock
    .expectOne('https://pokeapi.co/api/v2/pokemon-species/bulbasaur')
    .flush(MOCK_RAW_SPECIES);
}

describe('PokemonDetails', () => {
  let component: PokemonDetails;
  let fixture: ComponentFixture<PokemonDetails>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetails],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetails);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('name', 'bulbasaur');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    flushPokemonDetailRequests(httpMock);
    // Let the microtask queue drain so the evolutionChain resource's effect
    // (which reacts to species.value() resolving) has a chance to run and
    // issue its request before we look for it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    httpMock
      .expectOne('https://pokeapi.co/api/v2/evolution-chain/1/')
      .flush(MOCK_RAW_EVOLUTION_CHAIN);
    await fixture.whenStable();
  });

  it('fetches and renders the requested pokemon and its evolution chain', async () => {
    flushPokemonDetailRequests(httpMock);
    // Let the microtask queue drain so the evolutionChain resource's effect
    // (which reacts to species.value() resolving) has a chance to run and
    // issue its request before we look for it.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    httpMock
      .expectOne('https://pokeapi.co/api/v2/evolution-chain/1/')
      .flush(MOCK_RAW_EVOLUTION_CHAIN);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('bulbasaur');
    expect(compiled.textContent).toContain('grass');
    expect(compiled.textContent).toContain('ivysaur');
    expect(compiled.textContent).toContain('Level up');
    expect(compiled.textContent).toContain('Seed Pokémon');
    expect(compiled.textContent).toContain('A strange seed was planted on its back.');
    expect(compiled.textContent).toContain('tackle');
    expect(compiled.textContent).toContain('Red');
  });

  it('fetches a move type on demand and caches it', async () => {
    flushPokemonDetailRequests(httpMock);
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    httpMock
      .expectOne('https://pokeapi.co/api/v2/evolution-chain/1/')
      .flush(MOCK_RAW_EVOLUTION_CHAIN);
    await fixture.whenStable();
    fixture.detectChanges();

    component.loadMoveType(component.pokemon.value()!.levelUpMoves[0]);
    httpMock
      .expectOne('https://pokeapi.co/api/v2/move/33/')
      .flush({ type: { name: 'normal' } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.moveTypes().get('tackle')).toBe('normal');

    // Requesting the same move again should not issue a second HTTP call.
    component.loadMoveType(component.pokemon.value()!.levelUpMoves[0]);
    httpMock.expectNone('https://pokeapi.co/api/v2/move/33/');
  });
});
