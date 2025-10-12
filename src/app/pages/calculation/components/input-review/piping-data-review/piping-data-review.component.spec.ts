import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipingDataReviewComponent } from './piping-data-review.component';

describe('PipingDataReviewComponent', () => {
  let component: PipingDataReviewComponent;
  let fixture: ComponentFixture<PipingDataReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipingDataReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PipingDataReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMaterialName', () => {
    it('should return the correct material name for a known id', () => {
      expect(component.getMaterialName('carbon_steel')).toBe('Carbon Steel');
      expect(component.getMaterialName('stainless_steel')).toBe(
        'Stainless Steel',
      );
    });

    it('should return the id if material is not found', () => {
      expect(component.getMaterialName('unknown')).toBe('unknown');
    });
  });

  describe('getSpanTypeName', () => {
    it('should return the correct span type name for a known id', () => {
      expect(component.getSpanTypeName('stiff')).toBe('Stiff');
      expect(component.getSpanTypeName('medium_stiff')).toBe('Medium Stiff');
    });

    it('should return the id if span type is not found', () => {
      expect(component.getSpanTypeName('random')).toBe('random');
    });
  });

  describe('getPositionTypeLabel', () => {
    it('should return "Custom" if positionType is custom', () => {
      const item = { positionType: 'custom', position: 1 };
      expect(component.getPositionTypeLabel(item, 0)).toBe('Custom');
    });

    it('should return "Same as Production Manifold" if positionType is same_as_1 and position is 1', () => {
      const item = { positionType: 'same_as_1', position: 1 };
      expect(component.getPositionTypeLabel(item, 0)).toBe(
        'Same as Production Manifold',
      );
    });

    it('should return "Same as Export Manifold" if positionType is same_as_1 and position is 2', () => {
      const item = { positionType: 'same_as_1', position: 2 };
      expect(component.getPositionTypeLabel(item, 0)).toBe(
        'Same as Export Manifold',
      );
    });

    it('should return "Same as Export Manifold" if positionType is same_as_1 and position > 2', () => {
      const item = { positionType: 'same_as_1', position: 3 };
      expect(component.getPositionTypeLabel(item, 0)).toBe(
        'Same as Export Manifold',
      );
    });

    it('should return empty string if no condition matches', () => {
      const item = { positionType: 'other', position: 1 };
      expect(component.getPositionTypeLabel(item, 0)).toBe('');
    });
  });
});
