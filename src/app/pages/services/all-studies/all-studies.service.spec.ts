import { TestBed } from '@angular/core/testing';

import { AllStudiesService } from './all-studies.service';

describe('AllStudiesService', () => {
  let service: AllStudiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllStudiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
