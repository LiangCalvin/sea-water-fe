import { TestBed } from '@angular/core/testing';

import { CalculationContextService } from './CalculationContext.service';

describe('CalculationContextService', () => {
  let service: CalculationContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
