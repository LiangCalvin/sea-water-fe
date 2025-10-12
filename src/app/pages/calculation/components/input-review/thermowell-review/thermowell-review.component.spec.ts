import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermowellReviewComponent } from './thermowell-review.component';

describe('ThermowellReviewComponent', () => {
  let component: ThermowellReviewComponent;
  let fixture: ComponentFixture<ThermowellReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThermowellReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThermowellReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
