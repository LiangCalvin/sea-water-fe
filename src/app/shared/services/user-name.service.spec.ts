import { TestBed } from '@angular/core/testing';
import { UserNameService } from './user-name.service';

describe('UserNameService', () => {
  let service: UserNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format full name correctly', () => {
    const result = service.displayName('Somchai Sittichai');
    expect(result).toBe('Somchai Si.');
  });
  
  it('should handle only first name (no last name) without dot', () => {
    const result = service.displayName('Somchai');
    expect(result).toBe('Somchai ');
  });
  
  it('should return dash for empty string', () => {
    const result = service.displayName('');
    expect(result).toBe('-');
  });
  
  it('should return dash for undefined input', () => {
    const result = service.displayName(undefined as any);
    expect(result).toBe('-');
  });
  
  it('should return dash for null input', () => {
    const result = service.displayName(null as any);
    expect(result).toBe('-');
  });

 
  it('should return empty string if name is null', () => {
    const result = service.displayStudyName(null as any);
    expect(result).toBe('');
  });

  it('should return empty string if name is undefined', () => {
    const result = service.displayStudyName(undefined as any);
    expect(result).toBe('');
  });

  it('should return empty string if name is empty', () => {
    const result = service.displayStudyName('');
    expect(result).toBe('');
  });

  it('should return full name if length is less than 39', () => {
    const result = service.displayStudyName('Somchai');
    expect(result).toBe('Somchai');
  });

  it('should return full name if length is exactly 39', () => {
    const name = 'A'.repeat(29);
    const result = service.displayStudyName(name);
    expect(result).toBe(name);
  });

  it('should truncate name to 39 characters and add ".." if longer', () => {
    const longName = 'A'.repeat(50);
    const expected = longName.substring(0, 29) + '...';
    const result = service.displayStudyName(longName);
    expect(result).toBe(expected);
  });

    
});
