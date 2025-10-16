import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Others } from './others';

describe('Others', () => {
  let component: Others;
  let fixture: ComponentFixture<Others>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Others]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Others);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
