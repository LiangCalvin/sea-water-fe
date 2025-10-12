import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErosionReviewComponent } from './erosion-review.component';

describe('ErosionReviewComponent', () => {
  let component: ErosionReviewComponent;
  let fixture: ComponentFixture<ErosionReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErosionReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErosionReviewComponent);
    component = fixture.componentInstance;
    component.erosionDataInput = {
      calculationOption: 'Option A',
      velocity: 120,
    };

    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have expanded set to true by default', () => {
      expect(component.expanded).toBeTrue();
    });
  });

  describe('@Input erosionDataInput', () => {
    it('should accept erosionDataInput as input', () => {
      const mockData = { velocity: 120, thicknessLoss: 0.02 };
      component.erosionDataInput = mockData;
      fixture.detectChanges();

      expect(component.erosionDataInput).toEqual(mockData);
    });

    it('should handle null erosionDataInput gracefully', () => {
      component.erosionDataInput = null;
      fixture.detectChanges();

      expect(component.erosionDataInput).toBeNull();
    });
  });
});
