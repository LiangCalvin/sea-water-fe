import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InputDropdownService {
  private readonly closeAllDropdownSource = new Subject<string>();

  closeAllDropdown$ = this.closeAllDropdownSource.asObservable();

  closeAllDropdowns(exceptId: string = '') {
    this.closeAllDropdownSource.next(exceptId);
  }
}
