import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitForServiceComponent } from './fit-for-service.component';

describe('FitForServiceComponent', () => {
  let component: FitForServiceComponent;
  let fixture: ComponentFixture<FitForServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitForServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitForServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
