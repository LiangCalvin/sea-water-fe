import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStudiesComponent } from './all-studies.component';

describe('AllStudiesComponent', () => {
  let component: AllStudiesComponent;
  let fixture: ComponentFixture<AllStudiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStudiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllStudiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
