import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastNotification } from './toast-notification';

describe('ToastNotification', () => {
  let component: ToastNotification;
  let fixture: ComponentFixture<ToastNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastNotification]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToastNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toast after initialization', (done) => {
    setTimeout(() => {
      expect(component.isVisible).toBe(true);
      done();
    }, 20);
  });

  it('should hide toast after duration', (done) => {
    component.duration = 100;
    component.ngOnInit();
    
    setTimeout(() => {
      expect(component.isExiting).toBe(true);
      done();
    }, 150);
  });
});
