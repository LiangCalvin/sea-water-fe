import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowInducedVibrationComponent } from './flow-induced-vibration.component';

describe('FlowInducedVibrationComponent', () => {
  let component: FlowInducedVibrationComponent;
  let fixture: ComponentFixture<FlowInducedVibrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowInducedVibrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowInducedVibrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
