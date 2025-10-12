import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationInputComponent } from './calculation-input.component';

describe('CalculationInputComponent', () => {
  let component: CalculationInputComponent;
  let fixture: ComponentFixture<CalculationInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculationInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
