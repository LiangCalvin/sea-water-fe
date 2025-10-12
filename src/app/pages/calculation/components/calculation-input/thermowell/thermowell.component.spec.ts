import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermowellComponent } from './thermowell.component';

describe('ThermowellComponent', () => {
  let component: ThermowellComponent;
  let fixture: ComponentFixture<ThermowellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThermowellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThermowellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
