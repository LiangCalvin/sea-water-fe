import { TestBed } from '@angular/core/testing';

import { EnvironmentConfigurationService } from './environment-configuration.service';

describe('EnvironmentConfigurationService', () => {
  let service: EnvironmentConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
