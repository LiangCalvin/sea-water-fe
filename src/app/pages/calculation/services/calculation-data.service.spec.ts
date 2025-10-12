import { TestBed } from '@angular/core/testing';
import { CalculationDataService } from './calculation-data.service';
import { ThermowellData } from '../../../core/models/calculation/thermowell.model';
import { ErosionCalculationData } from '../../../core/models/calculation/erosion.model';
import { PipesimData } from '../../../core/models/calculation/pipesim.model';
import { FormBasicComposition, manualTableResponse } from '../../../core/models/calculation/model-and-basic-composition.model';

describe('CalculationDataService', () => {
  let service: CalculationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get basicModelData', () => {
    const mock: FormBasicComposition = { name: 'test' } as any;
    service.basicModelData = mock;
    expect(service.basicModelData).toEqual(mock);
  });

  it('should set and get tableCompositionlData', () => {
    const mock: manualTableResponse[] = [{ key: 'k', value: 'v' }] as any;
    service.tableCompositionlData = mock;
    expect(service.tableCompositionlData).toEqual(mock);
  });

  it('should set and get processData', () => {
    const mock = { foo: 'bar' };
    service.processData = mock;
    expect(service.processData).toEqual(mock);
  });

  it('should set and get processMode', () => {
    const mock = { mode: 'auto' };
    service.processMode = mock;
    expect(service.processMode).toEqual(mock);
  });

  it('should set and get pipingData', () => {
    const mock = { pipe: 42 };
    service.pipingData = mock;
    expect(service.pipingData).toEqual(mock);
  });

  it('should set and get pipingTypeCustomData', () => {
    const mock = { custom: true };
    service.pipingTypeCustomData = mock;
    expect(service.pipingTypeCustomData).toEqual(mock);
  });

  it('should set and get thermowellData', () => {
    const mock: ThermowellData = { id: 1 } as any;
    service.thermowellData = mock;
    expect(service.thermowellData).toEqual(mock);
  });

  it('should set and get erosionData', () => {
    const mock: ErosionCalculationData = { erosionRate: 0.5 } as any;
    service.erosionData = mock;
    expect(service.erosionData).toEqual(mock);
  });

  it('should set and get pipesimData', () => {
    const mock: PipesimData = { simulation: 'ok' } as any;
    service.pipesimData = mock;
    expect(service.pipesimData).toEqual(mock);
  });

  it('should reset all data to null', () => {
    service.basicModelData = { name: 'reset' } as any;
    service.processData = { foo: 'bar' };
    service.thermowellData = { id: 1 } as any;

    service.resetCalculationData();

    expect(service.basicModelData).toBeNull();
    expect(service.processData).toBeNull();
    expect(service.thermowellData).toBeNull();
    expect(service.erosionData).toBeNull();
    expect(service.pipesimData).toBeNull();
  });
});
