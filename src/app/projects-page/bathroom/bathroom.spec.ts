import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bathroom } from './bathroom';

describe('Bathroom', () => {
  let component: Bathroom;
  let fixture: ComponentFixture<Bathroom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bathroom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bathroom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
