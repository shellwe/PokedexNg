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
};

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

  it('should create', () => {
    expect(component).toBeTruthy();
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/bulbasaur').flush(MOCK_RAW_POKEMON);
  });

  it('fetches and renders the requested pokemon', async () => {
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/bulbasaur').flush(MOCK_RAW_POKEMON);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('bulbasaur');
    expect(compiled.textContent).toContain('grass');
  });
});
