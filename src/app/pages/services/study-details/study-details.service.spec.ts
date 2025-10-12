import { TestBed } from '@angular/core/testing';

import { StudyDetailsService } from './study-details.service';

describe('StudyDetailsService', () => {
  let service: StudyDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
