import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { PositionGroup } from '../../core/models/calculation/position-group.model';
import { EnvironmentConfigurationService } from '../../services/environment-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class CalculationContextService {

  constructor(
  ) { }

  private modelForm!: any;
  private readonly processForm$ = new BehaviorSubject<any | null>(null);
  private positionSelect: any;
  private positionSelectPiping: any;
  private pipingValid: boolean = false;
  private erosionForm!: any;

  private readonly pipesimValidate$ = new BehaviorSubject<any>(null);

  private readonly processInfoFormSubject = new BehaviorSubject<FormGroup | null>(null);
  private readonly pipingFormSubject = new BehaviorSubject<FormGroup | null>(null);
  private readonly processValidSubject = new BehaviorSubject<any>(null);
  private readonly pipingValidSubject = new BehaviorSubject<any>(null);
  private readonly erosionValidSubject = new BehaviorSubject<any>(null);
  private readonly thermowellValidSubject = new BehaviorSubject<any>(null);


  processInfoForm$ = this.processInfoFormSubject.asObservable();
  processValid$ = this.processValidSubject.asObservable();
  pipingValid$ = this.pipingValidSubject.asObservable();
  erosionValid$ = this.erosionValidSubject.asObservable();
  thermowellValid$ = this.thermowellValidSubject.asObservable();
  pipingForm$ = this.pipingFormSubject.asObservable();

  private readonly availableSequenceFlows: string[] = ['1,2,3,4', '1,2,3', '1,3,4', '1,3', '1,4'];
  private selectPosition: any;
  private envConfigService = inject(EnvironmentConfigurationService);
  private readonly SEQUENCE_FLOW = this.envConfigService.getSequenceFlow();
  private readonly selectPositionSubject = new BehaviorSubject<PositionGroup | null>(null);
  public selectPosition$ = this.selectPositionSubject.asObservable();

  setModelForm(form: any) {
    this.modelForm = form;
  }

  getModelForm(): any {
    return this.modelForm;
  }

  setProcessForm(val: any) {
    this.processForm$.next(val);
  }

  getProcessForm$(): Observable<any | null> {
    return this.processForm$.asObservable();
  }

  getProcessForm() {
    return this.processForm$.getValue();
  }

  setPipingForm(form: any) {
    this.pipingFormSubject.next(form);
  }

  setProcessInfoForm(form: any) {
    this.processInfoFormSubject.next(form);
  }

  setPosition(data: any) {
    this.positionSelect = data;
  }

  setSelectPosition(data: PositionGroup) {
    this.selectPosition = data;
    this.selectPositionSubject.next(data);
  }

  getSelectPosition(): PositionGroup | null {
    return this.selectPosition;
  }

  onSequenceFlowChange(sequenceFlow: string): void {
    if (!this.isValidSequenceFlow(sequenceFlow)) {
      return;
    }

    const currentPosition = this.getSelectPosition();
    const updatedPosition: PositionGroup = {
      ...currentPosition,
      sequenceFlow: sequenceFlow
    };

    this.setSelectPosition(updatedPosition);
  }

  getCurrentSequenceFlow(): string {
    return this.getSelectPosition()?.sequenceFlow ?? this.getDefaultPositionGroup().sequenceFlow;
  }

  getAvailableSequenceFlows(): string[] {
    return [...this.SEQUENCE_FLOW];
  }

  isValidSequenceFlow(sequenceFlow: string): boolean {
    return this.availableSequenceFlows.includes(sequenceFlow);
  }

  getDefaultPositionGroup(): PositionGroup {
    return { sequenceFlow: '1,2,3,4' };
  }
  getPosition(): any {
    return this.positionSelect;
  }

  setPositionTypePiping(data: any) {
    this.positionSelectPiping = data;
  }

  getPositionTypePiping(): any {
    return this.positionSelectPiping;
  }

  setErosionForm(form: any) {
    this.erosionForm = form;
  }

  getErosionForm() {
    return this.erosionForm.getValue();
  }

  setProcessValid(data: any): void {
    this.processValidSubject.next(data);
  }

  setPipingValid(data: any) {
    this.pipingValidSubject.next(data);
  }

  getPipingsValid(): any {
    return this.pipingValid;
  }

  setErosionValid(data: any) {
    this.erosionValidSubject.next(data);
  }

  setThermowellValid(data: any) {
    this.thermowellValidSubject.next(data);
  }

  setPipesimValidate(value: any): void {
    this.pipesimValidate$.next(value);
  }

  getPipesimValidate(): Observable<any> {
    return this.pipesimValidate$.asObservable();
  }

  parseLocalizedNumber(value: any): number {
    const setType = (value ?? '').toString();
    return parseFloat(setType.replace(/,/g, ''));
  }

}


