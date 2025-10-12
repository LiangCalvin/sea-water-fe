import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErosionComponent } from './erosion.component';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ErosionComponent', () => {
  let component: ErosionComponent;
  let fixture: ComponentFixture<ErosionComponent>;
  let mockCalculationService: jasmine.SpyObj<CalculationService>;
  let mockContextService: jasmine.SpyObj<CalculationContextService>;

  beforeEach(async () => {
    mockCalculationService = jasmine.createSpyObj('CalculationService', ['getErosionCalculationDataById', 'saveDraftErosionCalculationData']);
    mockContextService = jasmine.createSpyObj('CalculationContextService', ['setErosionForm', 'setErosionValid']);

    await TestBed.configureTestingModule({
      imports: [ErosionComponent, ReactiveFormsModule],
      providers: [
        { provide: CalculationService, useValue: mockCalculationService },
        { provide: CalculationContextService, useValue: mockContextService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ErosionComponent);
    component = fixture.componentInstance;
    mockCalculationService.getErosionCalculationDataById.and.returnValue(of({ data: {} }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('initializeForm', () => {
    it('should initialize form with default values', () => {
      expect(component.erosionForm).toBeDefined();
      expect(component.erosionForm.get('calculationType')?.value).toBe('maxSandRate');
    });
  });

  describe('getErosionCalculationData', () => {
    it('should patch form with data from service', () => {
      const mockData = {
        data: {
          calculation_type: 'maxSandRate',
          allowable_erosion_rate: 12.5,
          sand_diameter: 150,
          geometry_constant: 6.0,
          sand_production_rate: null,
        },
      };
      mockCalculationService.getErosionCalculationDataById.and.returnValue(of(mockData));
      component.study = { data: { study_id: '123' } };
      component.transactionId = { data: { transaction_id: 'tx123' } };

      component.getErosionCalculationData('123', 'tx123');
      expect(mockCalculationService.getErosionCalculationDataById).toHaveBeenCalledWith('123', 'tx123');
    });

    it('should handle error on data fetch', () => {
      spyOn(console, 'error');
      mockCalculationService.getErosionCalculationDataById.and.returnValue(throwError(() => new Error('Network Error')));
      component.getErosionCalculationData('123', 'tx123');
      expect(console.error).toHaveBeenCalled();
    });
  });


  describe('saveDraft', () => {
    it('should build correct payload and call service', async () => {
      component.study = { data: { studyId: '123' } };
      component.transactionId = { data: { transactionId: 'tx123' } };
      component.erosionForm.setValue({
        calculationType: 'maxSandRate',
        allowableErosionRate: 10,
        sandProductionRate: null,
        sandDiameter: 100,
        geometryConstant: 5.5,
      });

      mockCalculationService.saveDraftErosionCalculationData.and.returnValue(of({ response: { message: 'success' } }));

      await component.saveDraft();

      expect(mockCalculationService.saveDraftErosionCalculationData).toHaveBeenCalledWith(jasmine.objectContaining({
        studyId: '123',
        transactionId: 'tx123',
        calculationOption: {
          type: 'max_sand_rate',
          value: 10
        },
        sandDiameter: 100,
        geometryConstant: 5.5
      }));
    });

    it('should handle error when saveDraft fails', async () => {
      mockCalculationService.saveDraftErosionCalculationData.and.returnValue(
        throwError(() => new Error('API Failed'))
      );

      component.study = { data: { study_id: '123' } };
      component.transactionId = { data: { transaction_id: 'tx123' } };

      component.erosionForm.setValue({
        calculationType: 'allowableErosionRate',
        allowableErosionRate: null,
        sandProductionRate: 0.002,
        sandDiameter: 100,
        geometryConstant: 5.5,
      });

      await expectAsync(component.saveDraft()).toBeRejectedWith(jasmine.any(Error));
    });
  });

  describe('isFormValid getter', () => {
    it('should call contextService.setErosionValid with true when form is valid', () => {
      component.erosionForm.setValue({
        calculationType: 'maxSandRate',
        allowableErosionRate: 10,
        sandProductionRate: null,
        sandDiameter: 100,
        geometryConstant: 5.5
      });

      const result = component.isFormValid;

      expect(result).toBeTrue();
      expect(mockContextService.setErosionValid).toHaveBeenCalledWith(true);
    });

    it('should call contextService.setErosionValid with false when form is invalid', () => {
      component.erosionForm.setValue({
        calculationType: '',
        allowableErosionRate: null,
        sandProductionRate: null,
        sandDiameter: null,
        geometryConstant: null
      });

      const result = component.isFormValid;

      expect(result).toBeFalse();
      expect(mockContextService.setErosionValid).toHaveBeenCalledWith(false);
    });
  });

});
