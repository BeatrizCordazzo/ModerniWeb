import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Preview } from './preview';

describe('Preview', () => {
  let component: Preview;
  let fixture: ComponentFixture<Preview>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Preview],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Preview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 services', () => {
    expect(component.services.length).toBe(5);
  });

  it('should navigate to service route when navigateToService is called', () => {
    const testRoute = '/services/kitchen';
    component.navigateToService(testRoute);
    expect(mockRouter.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should have correct service properties', () => {
    const firstService = component.services[0];
    expect(firstService.title).toBeDefined();
    expect(firstService.description).toBeDefined();
    expect(firstService.image).toBeDefined();
    expect(firstService.route).toBeDefined();
  });
});
