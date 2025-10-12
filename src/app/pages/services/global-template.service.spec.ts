import { TestBed } from '@angular/core/testing';

import { GlobalTemplateService } from './global-template.service';

describe('GlobalTemplateService', () => {
  let service: GlobalTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
