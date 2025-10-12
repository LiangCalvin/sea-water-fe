import { TestBed } from '@angular/core/testing';

import { CreateStudyService } from './create-study.service';

describe('CreateStudyService', () => {
  let service: CreateStudyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateStudyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
