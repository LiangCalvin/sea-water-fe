import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioDescriptionComponent } from './radio-description.component';

describe('RadioDescriptionComponent', () => {
  let component: RadioDescriptionComponent;
  let fixture: ComponentFixture<RadioDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
