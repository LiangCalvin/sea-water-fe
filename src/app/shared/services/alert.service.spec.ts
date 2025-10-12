import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show a success alert', (done) => {
    service.alert$.subscribe(alert => {
      if (alert?.type === 'success') {
        expect(alert.title).toBe('Success');
        expect(alert.message).toBe('Operation complete');
        expect(alert.isVisible).toBeTrue();
        done();
      }
    });
    service.success('Success', 'Operation complete', false);
  });

  it('should show an error alert with default title', (done) => {
    service.alert$.subscribe(alert => {
      if (alert?.type === 'error') {
        expect(alert.title).toBe('Error');
        expect(alert.message).toBe('Something went wrong');
        expect(alert.isVisible).toBeTrue();
        done();
      }
    });
    service.error(undefined, 'Something went wrong', false);
  });

  it('should show an info alert with default title', (done) => {
    service.alert$.subscribe(alert => {
      if (alert?.type === 'info') {
        expect(alert.title).toBe('Info');
        expect(alert.message).toBe('For your information');
        expect(alert.isVisible).toBeTrue();
        done();
      }
    });
    service.info(undefined, 'For your information', false);
  });

  it('should close the alert manually', (done) => {
    service.success('Success', 'Manual close', false);
    service.alert$.subscribe(alert => {
      if (alert?.isVisible === false) {
        expect(alert.isVisible).toBeFalse();
        done();
      }
    });
    service.close();
  });

  it('should auto close the alert after specified duration', fakeAsync(() => {
    service.success('AutoClose', 'This will close automatically', true, 2000);

    let alertVisible = true;

    const sub = service.alert$.subscribe(alert => {
      if (alert !== null) {
        alertVisible = alert.isVisible;
      }
    });

    tick(1999);
    expect(alertVisible).toBeTrue();

    tick(1);
    expect(alertVisible).toBeFalse();

    sub.unsubscribe();
  }));

  it('getErrorMessage should return nested message if present', () => {
    const error = {
      error: {
        errors: [
          { message: 'Specific error message' }
        ]
      }
    };
    const msg = service.getErrorMessage(error);
    expect(msg).toBe('Specific error message');
  });

  it('getErrorMessage should return default message if nested error is missing', () => {
    const error = {};
    const msg = service.getErrorMessage(error);
    expect(msg).toBe('Unknown error');
  });
});