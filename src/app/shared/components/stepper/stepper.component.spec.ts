import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate activeLineHeight correctly', () => {
    component.activeStep = 3;
    const expectedHeight = `${3 * 3.57}rem`;
    expect(component.activeLineHeight).toBe(expectedHeight);
  });

  it('should emit stepClicked when step is clicked and not disabled and index <= stepOrigin', () => {
    spyOn(component.stepClicked, 'emit');
    component.disabled = false;
    component.stepOrigin = 2;

    component.onStepClick(1);
    expect(component.stepClicked.emit).toHaveBeenCalledWith(1);

    component.onStepClick(2);
    expect(component.stepClicked.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit stepClicked when component is disabled', () => {
    spyOn(component.stepClicked, 'emit');
    component.disabled = true;
    component.stepOrigin = 2;

    component.onStepClick(1);
    expect(component.stepClicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit stepClicked when index > stepOrigin', () => {
    spyOn(component.stepClicked, 'emit');
    component.disabled = false;
    component.stepOrigin = 2;

    component.onStepClick(3);
    expect(component.stepClicked.emit).not.toHaveBeenCalled();
  });
});
