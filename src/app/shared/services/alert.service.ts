import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertData {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly _alert$ = new BehaviorSubject<AlertData | null>(null);
  readonly alert$ = this._alert$.asObservable();

  show(type: AlertData['type'], title: string, message: string, autoClose = true, duration = 3000) {
    const alert: AlertData = {
      type,
      title,
      message,
      isVisible: true,
      autoClose,
      duration
    };

    this._alert$.next(alert);

    if (autoClose) {
      setTimeout(() => {
        this.close();
      }, duration);
    }
  }

  success(title = 'Success', message: string, autoClose = true, duration = 3000) {
    this.show('success', title, message, autoClose, duration);
  }

  error(title = 'Error', message: string, autoClose = true, duration = 3000) {
    this.show('error', title, message, autoClose, duration);
  }

  info(title = 'Info', message: string, autoClose = true, duration = 3000) {
    this.show('info', title, message, autoClose, duration);
  }

  getErrorMessage(error: any): string {
    return error?.error?.errors?.[0]?.message ?? 'Unknown error';
  }

  getStatusCode(error: any): string {
    return error?.error?.errors?.[0]?.code ?? 'Unknown error';
  }


  close() {
    const current = this._alert$.value;
    if (current) {
      this._alert$.next({ ...current, isVisible: false });
    }
  }
}
