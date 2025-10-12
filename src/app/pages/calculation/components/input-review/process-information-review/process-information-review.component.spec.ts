import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessInformationReviewComponent } from './process-information-review.component';

describe('ProcessInformationReviewComponent', () => {
  let component: ProcessInformationReviewComponent;
  let fixture: ComponentFixture<ProcessInformationReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessInformationReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessInformationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
