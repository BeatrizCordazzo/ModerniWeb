import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bedroom } from './bedroom';

describe('Bedroom', () => {
  let component: Bedroom;
  let fixture: ComponentFixture<Bedroom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bedroom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bedroom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
