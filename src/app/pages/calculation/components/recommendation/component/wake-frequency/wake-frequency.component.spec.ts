import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WakeFrequencyComponent } from './wake-frequency.component';

describe('WakeFrequencyComponent', () => {
  let component: WakeFrequencyComponent;
  let fixture: ComponentFixture<WakeFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WakeFrequencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WakeFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
