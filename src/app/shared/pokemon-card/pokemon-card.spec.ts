import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PokemonCard } from './pokemon-card';

describe('PokemonCard', () => {
  let component: PokemonCard;
  let fixture: ComponentFixture<PokemonCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pokemon', { id: 1, name: 'bulbasaur', url: '' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
