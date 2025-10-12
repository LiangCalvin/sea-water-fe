import { TestBed } from '@angular/core/testing';

import { CalculationDataService } from './calculation-data.service';

describe('CalculationDataService', () => {
  let service: CalculationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
