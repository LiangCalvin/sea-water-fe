import { TestBed } from '@angular/core/testing';
import { CalculationContextService } from './CalculationContext.service';
import { PositionGroup } from '../../core/models/calculation/position-group.model';
import { skip } from 'rxjs/operators';
import { EnvironmentConfigurationService } from '../../services/environment-configuration.service';

describe('CalculationContextService', () => {
  let service: CalculationContextService;
  let mockEnvConfigService: jasmine.SpyObj<EnvironmentConfigurationService>;

  beforeEach(() => {
    mockEnvConfigService = jasmine.createSpyObj('EnvironmentConfigurationService', [
      'getSequenceFlow'
    ]);

    mockEnvConfigService.getSequenceFlow.and.returnValue([
      '1,2,3,4',
      '1,2,3',
      '1,3,4',
      '1,3',
      '1,4'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CalculationContextService,
        { provide: EnvironmentConfigurationService, useValue: mockEnvConfigService }
      ]
    });

    service = TestBed.inject(CalculationContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get select position', () => {
    const mockPosition: PositionGroup = { sequenceFlow: '1,2,3' };
    service.setSelectPosition(mockPosition);
    expect(service.getSelectPosition()).toEqual(mockPosition);
  });

  it('should emit value from selectPosition$ observable', (done) => {
    const mockPosition: PositionGroup = { sequenceFlow: '1,3' };

    service.selectPosition$
      .pipe(skip(1))
      .subscribe(value => {
        expect(value).toEqual(mockPosition);
        done();
      });

    service.setSelectPosition(mockPosition);
  });

  it('should validate correct and incorrect sequence flows', () => {
    expect(service.isValidSequenceFlow('1,2,3')).toBeTrue();
    expect(service.isValidSequenceFlow('9,9')).toBeFalse();
  });

  it('should update sequence flow via onSequenceFlowChange', () => {
    const mockPosition: PositionGroup = { sequenceFlow: '1,2,3' };
    service.setSelectPosition(mockPosition);

    service.onSequenceFlowChange('1,3');
    expect(service.getCurrentSequenceFlow()).toBe('1,3');
  });

  it('should fallback to default sequence flow when none set', () => {
    service.setSelectPosition(null as any);
    expect(service.getCurrentSequenceFlow()).toBe('1,2,3,4');
  });

  it('should parse localized numbers correctly', () => {
    expect(service.parseLocalizedNumber('1,234.56')).toBeCloseTo(1234.56);
    expect(service.parseLocalizedNumber('9,876')).toBe(9876);
  });

  it('should emit value from processForm$', (done) => {
    const formMock = { test: true };

    service.getProcessForm$()
      .pipe(skip(1))
      .subscribe(val => {
        expect(val).toEqual(formMock);
        done();
      });

    service.setProcessForm(formMock);
  });

  it('should emit value from processValid$', (done) => {
    const valid = true;

    service.processValid$
      .pipe(skip(1))
      .subscribe(val => {
        expect(val).toBe(valid);
        done();
      });

    service.setProcessValid(valid);
  });

  it('should emit value from pipingForm$', (done) => {
    const formGroupMock = { controls: {} } as any;

    service.pipingForm$
      .pipe(skip(1))
      .subscribe(val => {
        expect(val).toEqual(formGroupMock);
        done();
      });

    service.setPipingForm(formGroupMock);
  });

  it('should emit value from pipesimValidate$', (done) => {
    const valid = { status: 'ok' };

    service.getPipesimValidate()
      .pipe(skip(1))
      .subscribe(val => {
        expect(val).toEqual(valid);
        done();
      });

    service.setPipesimValidate(valid);
  });

  it('should get available sequence flows', () => {
    const flows = service.getAvailableSequenceFlows();
    expect(flows).toContain('1,2,3,4');
    expect(flows.length).toBe(5);
  });
});
