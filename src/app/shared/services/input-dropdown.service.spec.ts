import { TestBed } from '@angular/core/testing';

import { InputDropdownService } from './input-dropdown.service';

describe('InputDropdownService', () => {
  let service: InputDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should emit a value when closeAllDropdowns is called', (done) => {
    const testId = 'dropdown-1';

    service.closeAllDropdown$.subscribe((emittedId) => {
      expect(emittedId).toBe(testId);
      done();
    });

    service.closeAllDropdowns(testId);
  });

  it('should emit an empty string when closeAllDropdowns is called with no argument', (done) => {
    service.closeAllDropdown$.subscribe((emittedId) => {
      expect(emittedId).toBe('');
      done();
    });

    service.closeAllDropdowns();
  });
});
