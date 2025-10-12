import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipesimReviewComponent } from './pipesim-review.component';

describe('PipesimReviewComponent', () => {
  let component: PipesimReviewComponent;
  let fixture: ComponentFixture<PipesimReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesimReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PipesimReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
