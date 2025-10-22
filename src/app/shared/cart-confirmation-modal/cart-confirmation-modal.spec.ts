import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartConfirmationModal } from './cart-confirmation-modal';

describe('CartConfirmationModal', () => {
  let component: CartConfirmationModal;
  let fixture: ComponentFixture<CartConfirmationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartConfirmationModal]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartConfirmationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm event when onConfirm is called', () => {
    spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event when onCancel is called', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
