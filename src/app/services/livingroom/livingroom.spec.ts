import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Livingroom } from './livingroom';

describe('Livingroom', () => {
  let component: Livingroom;
  let fixture: ComponentFixture<Livingroom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Livingroom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Livingroom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
