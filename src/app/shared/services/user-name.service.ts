import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserNameService {

  constructor() { }

  displayName(name: string): string {
    if (!name) return '-';
    const splitStr = name.split(' ');
    const firstName = splitStr[0] ?? '';
    const lastName = splitStr[1]?.substring(0, 2) ?? '';
    return `${firstName} ${lastName}${lastName ? '.' : ''}`;
  }


  displayStudyName(name: string) {
    return name?.length > 29 ? name.substring(0, 29) + '...' : name || '';
  }
  

  formatOneDecimalIfNeeded(value: number, decimal:number): number {
    return value % 1 === 0 ? value : parseFloat(value.toFixed(decimal));
  }
  
  
}
