import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExcelTableService {

  constructor() { }


  private readonly _tableValue$ = new BehaviorSubject<any>(null);

  setTableValue(value: any): void {
    this._tableValue$.next(value);
  }

  getTableValue$() {
    return this._tableValue$.asObservable();
  }

  getSnapshot(): any {
    return this._tableValue$.getValue();
  }
}
