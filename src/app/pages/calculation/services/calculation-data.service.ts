import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThermowellData } from '../../../core/models/calculation/thermowell.model';
import { ErosionCalculationData } from '../../../core/models/calculation/erosion.model';
import { PipesimData } from '../../../core/models/calculation/pipesim.model';
import { FormBasicComposition, manualComposition, manualTableResponse } from '../../../core/models/calculation/model-and-basic-composition.model';

@Injectable({
  providedIn: 'root',
})
export class CalculationDataService {
  // Noted: need interface for this object
  private readonly _basicModelData = new BehaviorSubject<any>(null);
  private readonly _tableCompositionlData = new BehaviorSubject<any>(null);
  private readonly _processData = new BehaviorSubject<any>(null);
  private readonly _processMode = new  BehaviorSubject<any>(null);
  private readonly _pipingData = new BehaviorSubject<any>(null);
  private readonly _pipingTypeCustomData = new BehaviorSubject<any>(null);
  private readonly _pipingPosition = new BehaviorSubject<any>(null);
  private readonly _pipingSequenceFlow = new BehaviorSubject<any>(null);

  private readonly _thermowellData = new BehaviorSubject<any>(null);
  private readonly _erosionData = new BehaviorSubject<any>(null);
  private readonly _pipesimData = new BehaviorSubject<any>(null);

  get basicModelData() {
    return this._basicModelData.value;
  }

  set basicModelData(data:FormBasicComposition) {
     this._basicModelData.next(data);
  }

  get tableCompositionlData() {
    return this._tableCompositionlData.value;
  }

  set tableCompositionlData(data:manualTableResponse[]) {
     this._tableCompositionlData.next(data);
  }
  
  get processData() {
    return this._processData.value;
  }

  set processData(data: any) {
    this._processData.next(data);
  }

  get processMode() {
    return this._processMode.value;
  }

  set processMode(data: any) {
    this._processMode.next(data);
  }

  get pipingData() {
    return this._pipingData.value;
  }

  set pipingData(data: any) {
    this._pipingData.next(data);
  }

  get pipingTypeCustomData() {
    return this._pipingTypeCustomData.value;
  }

  set pipingTypeCustomData(data: any) {
    this._pipingTypeCustomData.next(data);
  }

  get thermowellData() {
    return this._thermowellData.value;
  }

  set thermowellData(data: ThermowellData) {
    this._thermowellData.next(data);
  }

  get erosionData() {
    return this._erosionData.value;
  }

  set erosionData(data: ErosionCalculationData) {
    this._erosionData.next(data);
  }

  get pipesimData() {
    return this._pipesimData.value;
  }

  set pipesimData(data:PipesimData) {
    this._pipesimData.next(data);
  }

  resetCalculationData() {
    this._basicModelData.next(null);
    this._tableCompositionlData.next(null);
    this._processData.next(null);
    this._processMode.next(null);
    this._pipingData.next(null);
    this._thermowellData.next(null);
    this._erosionData.next(null);
    this._pipesimData.next(null);
  }



}
