import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title as empty string', () => {
    expect(component.title).toBe('');
  });

  it('should accept title input', () => {
    component.title = 'Test Tooltip';
    fixture.detectChanges();
    expect(component.title).toBe('Test Tooltip');
  });
});
