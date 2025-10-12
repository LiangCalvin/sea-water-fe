import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { CalculationContextService } from '../../../CalculationContext.service';
import { DropdownComponent } from "../../../../../shared/components/dropdown/dropdown.component";
import { IdName } from '../../../../../core/models/calculation/dropdown-option.model';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from "../../../../../shared/components/input-text/input-text.component";
import { RadioComponent } from "../../../../../shared/components/radio/radio.component";
import { GlobalTemplateService } from '../../../../../services/global-template.service';
import { AlertMessageConstants } from '../../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../../shared/services/alert.service';
import { GlobalService } from '../../../../../services/global.service';
import { CalculationDataService } from '../../../services/calculation-data.service';
import { FormValues, MappedFormEntry, Position } from '../../../../../core/models/calculation/process-information.mode';
import { RoleEnum } from '../../../../../core/enums/role.enum';
import { TableComposition } from '../../../../../core/models/calculation/model-and-basic-composition.model';

@Component({
  selector: 'app-process-information',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormsModule,
    NzGridModule,
    CollapseComponent,
    DropdownComponent,
    InputTextComponent,
    RadioComponent,
  ],
  templateUrl: './process-information.component.html',
  styleUrl: './process-information.component.scss',
  standalone: true,
})
export class ProcessInformationComponent implements OnInit {
  @Input() createdBy: string | null = null;
  @ViewChild('innerDiv', { read: ElementRef }) innerDiv!: ElementRef;
  @Output() interacted = new EventEmitter<void>();

  expanded = true;
  editMode = false;
  processForm!: FormGroup;
  formGroups: { [key: string]: FormGroup } = {};
  itemPreSelections: { [key: string]: string } = {};
  positionTypes: { [key: string]: string } = {};
  sequenceFlow = '1,2,3,4';
  studyCode: string = '';
  study: any;
  transactionId: any;
  fetchedData: any[] = [];
  isLoading = false;
  Owner: any;
  hasFullAccess: boolean = false;
  currentUser: string = '';
  displayValues: Record<string, { [key: string]: string }> = {};
  private templateService = inject(GlobalTemplateService);
  private originalFormValues: { [key: string]: any } = {};

  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');

  dropdownOptions: IdName[] = [
    { id: 'same_as_1', name: 'Same as position 1' },
    { id: 'custom', name: 'Custom' }
  ];

  private destroy$ = new Subject<void>();
  private allFormData: { [key: string]: FormValues } = {};
  private allSelections: { [key: string]: string } = {};
  private allPositionTypes: { [key: string]: string } = {};

  private readonly defaultFormValues: FormValues = {
    gas: 80,
    condensateType: 'Condensate Flowrate',
    condensateValue: 3200,
    cgrValue: 40,
    waterType: 'Water Flowrate',
    waterValue: 4000,
    wgrValue: 50,
    h2s: 120,
    co2: 50,
    exportTemperature: 120,
    exportPressure: 33
  };

  private readonly defaultPositions : Position[] = [
    { position: 1, subPosition: 1 },
    { position: 2, subPosition: 1 },
    { position: 2, subPosition: 2 },
  ];

  condensateRadioOptions = [
    { label: 'Condensate Flowrate', value: 'Condensate Flowrate' },
    { label: 'CGR', value: 'CGR' }
  ];

  waterRadioOptions = [
    { label: 'Water Flowrate', value: 'Water Flowrate' },
    { label: 'WGR', value: 'WGR' }
  ];


  constructor(
    private fb: FormBuilder,
    private calculationService: CalculationService,
    private calculationContextService: CalculationContextService,
    private alertService: AlertService,
    private globalService: GlobalService,
    private readonly calculationDataService: CalculationDataService
  ) {
    this.Owner = this.globalService.getUserFullName();
    this.hasFullAccess = this.globalService.hasPermissionSync(RoleEnum.FULL_ACCESS);
  }

  ngOnInit() {
    if (!this.createdBy) {
      const transactionData = sessionStorage.getItem('transactionId');
      if (transactionData) {
        const parsed = JSON.parse(transactionData);
        this.createdBy = parsed.data?.createdBy || null;
      }
    }
    this.loadSessionData();
    this.observeSequenceFlowChanges();
      const studyId = this.study?.data?.studyId;
    const transactionId = this.transactionId?.data?.transactionId;
    this.setDefaultCo2Value(studyId, transactionId).then(() => {
      if (this.study?.data?.studyId) {
        this.getProcessInformation(this.study?.data?.studyId, this.transactionId?.data?.transactionId);
      } else {
        this.initializeDefaultForm();
      }
    });
  }

  ngOnDestroy() {
    const data = this.defaultPositions.map(pos => {
      const key = `${pos.position}-${pos.subPosition}`;

      let base = this.fetchedData.find(
        d => d.position === pos.position && d.subPosition === pos.subPosition
      );

      if (!base && this.calculationDataService.processData?.length) {
        base = this.calculationDataService.processData.find(
          (d: { position: number; subPosition: number }) =>
            d.position === pos.position && d.subPosition === pos.subPosition
        );
      }

      base = base || {};
      const rawValue = this.formGroups[key]?.getRawValue?.() || {};

      return {
        position: pos.position,
        subPosition: pos.subPosition,
        positionType: this.positionTypes[key] ?? base.positionType,

        flowRate: {
          gas: (rawValue.gas ?? base.flowRate?.gas) || '',
          condensate: {
            type: rawValue.condensateType
              ? rawValue.condensateType === 'CGR' ? 'CGR' : 'flowrate'
              : base.flowRate?.condensate?.type,
            value: rawValue.condensateType
              ? (rawValue.condensateType === 'CGR'
                ? rawValue.cgrValue
                : rawValue.condensateValue)
              : base.flowRate?.condensate?.value || '',
          },
          water: {
            type: rawValue.waterType
              ? rawValue.waterType === 'WGR' ? 'WGR' : 'flowrate'
              : base.flowRate?.water?.type,
            value: rawValue.waterType
              ? (rawValue.waterType === 'WGR'
                ? rawValue.wgrValue
                : rawValue.waterValue)
              : base.flowRate?.water?.value || '',
          },
        },

        composition: {
          h2s: rawValue.h2s ?? (base.composition?.h2s || ''),
          co2: rawValue.co2 ?? (base.composition?.co2 || ''),
        },

        temperature: {
          export: rawValue.exportTemperature ?? (base.temperature?.export || ''),
          pressure: rawValue.exportPressure ?? (base.temperature?.pressure || ''),
        }
      };
    });

    this.calculationDataService.processData = data;
    this.calculationDataService.processMode = this.editMode;
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadSessionData() {
    this.study = JSON.parse(sessionStorage.getItem('study') || '{}');
    this.transactionId = JSON.parse(sessionStorage.getItem('transactionId') || '{}');
  }

  private observeSequenceFlowChanges(): void {
    this.calculationContextService.selectPosition$
      .pipe(
        takeUntil(this.destroy$),
        filter(position => position !== null),
        distinctUntilChanged((prev, curr) => {
          return prev?.sequenceFlow === curr?.sequenceFlow;
        })
      )
      .subscribe(position => {
        if (position?.sequenceFlow && position.sequenceFlow !== this.sequenceFlow) {
          this.sequenceFlow = position.sequenceFlow;
          this.handleSequenceFlowChange();
        }
      });
  }

  private handleSequenceFlowChange(): void {
    this.preserveCurrentFormData();

    const positionsToShow = this.getPositionsForSequenceFlow(this.sequenceFlow);
    this.fetchedData = positionsToShow;
    if (!this.calculationDataService.processData) {
      this.rebuildFormsForSequenceFlow();
    } else {
      this.rebuildFormsForSequenceFlowByTemp();
    }

  }



  private preserveCurrentFormData(): void {
    Object.keys(this.formGroups).forEach(key => {
      if (this.formGroups[key]) {
        this.allFormData[key] = this.formGroups[key].value;
        this.allSelections[key] = this.itemPreSelections[key];
        this.allPositionTypes[key] = this.positionTypes[key];
      }
    });
  }

  private rebuildFormsForSequenceFlow(): void {
    this.formGroups = {};
    this.itemPreSelections = {};
    this.positionTypes = {};

    const positionsToShow = this.getPositionsForSequenceFlow(this.sequenceFlow);
    const useSameAs1 = this.sequenceFlow === '1,2,3' || this.sequenceFlow === '1,2,3,4';

    positionsToShow.forEach((position) => {
      const key = `${position.position}-${position.subPosition}`;
      let defaultType = 'custom';
      if (position.position === 2 && useSameAs1) {
        defaultType = 'same_as_1';
      }

      if (this.allFormData[key]) {
        this.formGroups[key] = this.createFormGroup(this.allFormData[key]);
        const existingSelection = this.allSelections[key];
        const existingPositionType = this.allPositionTypes[key];
        if (position.position === 2) {
          if (useSameAs1) {
            if (existingSelection === 'same_as_1' || existingSelection === 'custom') {
              this.itemPreSelections[key] = existingSelection;
              this.positionTypes[key] = existingPositionType;
            } else {
              this.itemPreSelections[key] = defaultType;
              this.positionTypes[key] = defaultType;
              this.allSelections[key] = defaultType;
              this.allPositionTypes[key] = defaultType;
            }
          } else {
            this.itemPreSelections[key] = 'custom';
            this.positionTypes[key] = 'custom';
            this.allSelections[key] = 'custom';
            this.allPositionTypes[key] = 'custom';
          }
        } else {
          this.itemPreSelections[key] = existingSelection || defaultType;
          this.positionTypes[key] = existingPositionType || defaultType;
        }
      } else {
        this.formGroups[key] = this.createFormGroup(this.defaultFormValues);
        this.itemPreSelections[key] = defaultType;
        this.positionTypes[key] = defaultType;
        this.allFormData[key] = this.defaultFormValues;
        this.allSelections[key] = defaultType;
        this.allPositionTypes[key] = defaultType;
      }
    });

    positionsToShow.forEach((position) => {
      const key = `${position.position}-${position.subPosition}`;
      const formGroup = this.formGroups[key];
      const positionType = this.itemPreSelections[key];

      if (formGroup) {
        if (positionType === 'custom') {
          formGroup.enable();
        } else {
          formGroup.disable();
        }
        if (!this.editMode) {
          formGroup.disable();
        }
      }
    });

    this.calculationContextService.setProcessForm(this.formGroups);
    this.calculationContextService.setPosition(this.itemPreSelections);

    this.validateProcessInformation();
    this.watchFormChanges();
  }

  private rebuildFormsForSequenceFlowByTemp(): void {
    this.formGroups = {};
    this.itemPreSelections = {};
    this.positionTypes = {};
    const _processData = this.calculationDataService.processData.map((e: any) => {
      return {
        gas: this.parseNumber(e.flowRate.gas),
        condensateType: e.flowRate.condensate?.type === 'CGR' ? 'CGR' : 'Condensate Flowrate',
        condensateValue: this.parseNumber(e.flowRate.condensate?.value),
        cgrValue: this.parseNumber(e.flowRate.condensate?.value),
        waterType: e.flowRate.water?.type === 'WGR' ? 'WGR' : 'Water Flowrate',
        waterValue: this.parseNumber(e.flowRate.water?.value),
        wgrValue: this.parseNumber(e.flowRate.water?.value),
        h2s: this.parseNumber(e.composition.h2s),
        co2: this.parseNumber(e.composition.co2),
        exportTemperature: this.parseNumber(e.temperature.export),
        exportPressure: this.parseNumber(e.temperature.pressure)
      }
    }
    )
    const positionsToShow = this.getPositionsForSequenceFlow(this.sequenceFlow);
    const useSameAs1 = this.sequenceFlow === '1,2,3' || this.sequenceFlow === '1,2,3,4';

    positionsToShow.forEach((position, index) => {
      const key = `${position.position}-${position.subPosition}`;
      let defaultType = 'custom';
      if (position.position === 2 && useSameAs1) {
        defaultType = 'same_as_1';
      }

      if (_processData[index]) {
        this.formGroups[key] = this.createFormGroup(_processData[index]);
        const existingSelection = this.calculationDataService.processData[index].positionType;
        const existingPositionType = this.calculationDataService.processData[index].positionType;

        if (position.position === 2) {
          if (useSameAs1) {
            if (existingSelection === 'same_as_1' || existingSelection === 'custom') {
              this.itemPreSelections[key] = existingSelection;
              this.positionTypes[key] = existingPositionType;
            } else {
              this.itemPreSelections[key] = defaultType;
              this.positionTypes[key] = defaultType;
              this.allSelections[key] = defaultType;
              this.allPositionTypes[key] = defaultType;
            }
          } else {
            this.itemPreSelections[key] = 'custom';
            this.positionTypes[key] = 'custom';
            this.allSelections[key] = 'custom';
            this.allPositionTypes[key] = 'custom';
          }
        } else {
          this.itemPreSelections[key] = existingSelection || defaultType;
          this.positionTypes[key] = existingPositionType || defaultType;
        }
      } else {
        this.formGroups[key] = this.createFormGroup(this.defaultFormValues);
        this.itemPreSelections[key] = defaultType;
        this.positionTypes[key] = defaultType;
        this.allFormData[key] = this.defaultFormValues;
        this.allSelections[key] = defaultType;
        this.allPositionTypes[key] = defaultType;
      }
    });
    positionsToShow.forEach((position) => {
      const key = `${position.position}-${position.subPosition}`;
      const formGroup = this.formGroups[key];
      const positionType = this.itemPreSelections[key];

      if (formGroup) {
        if (positionType === 'custom') {
          formGroup.enable();
        } else {
          formGroup.disable();
        }
        if (!this.editMode) {
          formGroup.disable();
        }
      }
    });

    this.calculationContextService.setProcessForm(this.formGroups);
    this.calculationContextService.setPosition(this.itemPreSelections);

    this.validateProcessInformation();
    this.watchFormChanges();
  }

  private getPositionsForSequenceFlow(sequenceFlow: string): any[] {
    const hidePosition2Flows = ['1,3,4', '1,4', '1,3'];
    if (hidePosition2Flows.includes(sequenceFlow)) {
      return this.defaultPositions.filter(pos => pos.position === 1);
    }
    return [...this.defaultPositions];
  }

  private initializeDefaultForm(): void {
    const sequenceFlow = this.calculationContextService.getSelectPosition()?.sequenceFlow || this.sequenceFlow;

    const positionsToShow = this.getPositionsForSequenceFlow(sequenceFlow);
    this.fetchedData = positionsToShow;
    this.formGroups = {};

    const useSameAs1 = sequenceFlow === '1,2,3' || sequenceFlow === '1,2,3,4';

    this.defaultPositions.forEach((position) => {
      const key = `${position.position}-${position.subPosition}`;

      let defaultType = 'custom';
      if (position.position === 2) {
        defaultType = 'same_as_1';
      }

      this.allFormData[key] = this.defaultFormValues;
      this.allSelections[key] = defaultType;
      this.allPositionTypes[key] = defaultType;
    });

    positionsToShow.forEach((position) => {
      const key = `${position.position}-${position.subPosition}`;
      this.formGroups[key] = this.createFormGroup(this.allFormData[key]);
      this.itemPreSelections[key] = this.allSelections[key];
      this.positionTypes[key] = this.allPositionTypes[key];
    });

    this.calculationContextService.setProcessForm(this.formGroups);
    this.formGroups['1-1'].valueChanges.subscribe(value => {
      this.calculationContextService.setProcessInfoForm(this.formGroups['1-1']);
    });
    this.calculationContextService.setPosition(this.itemPreSelections);
    this.validateProcessInformation();
    this.watchFormChanges();
  }

  private numberRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      if (typeof value === 'string') {
        value = value.replace(/,/g, '');
      }

      const numValue = Number(value);

      if (isNaN(numValue)) {
        return { invalidNumber: { value, expected: 'number' } };
      }

      if (numValue < min) {
        return { min: { min, actual: numValue } };
      }

      if (numValue > max) {
        return { max: { max, actual: numValue } };
      }

      return null;
    };
  }

  private createFormGroup(values: FormValues): FormGroup {
    return this.fb.group({
      gas: [{ value: values.gas, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 300)]],
      condensateType: [{ value: values.condensateType, disabled: !this.editMode }],
      condensateValue: [{ value: values.condensateValue, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 20000)]],
      cgrValue: [{ value: values.cgrValue, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 500)]],
      waterType: [{ value: values.waterType, disabled: !this.editMode }],
      waterValue: [{ value: values.waterValue, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 20000)]],
      wgrValue: [{ value: values.wgrValue, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 500)]],
      h2s: [{ value: values.h2s, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 200)]],
      co2: [{ value: values.co2, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 100)]],
      exportTemperature: [{ value: values.exportTemperature, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 135)]],
      exportPressure: [{ value: values.exportPressure, disabled: !this.editMode }, [Validators.required, this.numberRangeValidator(0, 91)]],
    });
  }

  private mapFetchedDataToForm(data: MappedFormEntry[]): void {
    this.formGroups = {};

    const sequenceFlow = this.calculationContextService.getSelectPosition()?.sequenceFlow || this.sequenceFlow;
    const positionsToShow = this.getPositionsForSequenceFlow(sequenceFlow);
    this.fetchedData = positionsToShow;

    const dataMap = new Map<string, MappedFormEntry>();
    data.forEach(entry => {
      const key = `${entry.position}-${entry.subPosition}`;
      dataMap.set(key, entry);
    });

    const useSameAs1 = sequenceFlow === '1,2,3' || sequenceFlow === '1,2,3,4';
    positionsToShow.forEach(position => {
      const key = `${position.position}-${position.subPosition}`;
      delete this.allFormData[key];
      delete this.allSelections[key];
      delete this.allPositionTypes[key];
    });
    positionsToShow.forEach(position => {
      const key = `${position.position}-${position.subPosition}`;
      const entry = dataMap.get(key);

      let formValues = this.defaultFormValues;
      let positionType = 'custom';

      if (entry) {
        const flowRate = entry.flowRate ?? {};
        const composition = entry.composition ?? {};
        const temperature = entry.temperature ?? {};

        formValues = {
          ...this.defaultFormValues,
          gas: flowRate.gas ?? this.defaultFormValues.gas,
          condensateType: flowRate.condensate?.type === 'CGR' ? 'CGR' : 'Condensate Flowrate',
          condensateValue: flowRate.condensate?.value ?? this.defaultFormValues.condensateValue,
          cgrValue: flowRate.condensate?.value ?? this.defaultFormValues.cgrValue,
          waterType: flowRate.water?.type === 'WGR' ? 'WGR' : 'Water Flowrate',
          waterValue: flowRate.water?.value ?? this.defaultFormValues.waterValue,
          wgrValue: flowRate.water?.value ?? this.defaultFormValues.wgrValue,
          h2s: composition.h2s ?? this.defaultFormValues.h2s,
          co2: composition.co2 ?? this.defaultFormValues.co2,
          exportTemperature: temperature.export ?? this.defaultFormValues.exportTemperature,
          exportPressure: temperature.pressure ?? this.defaultFormValues.exportPressure,
        };

        if (position.position === 2) {
          if (useSameAs1) {
            if (entry.positionType === 'same_as_1' || entry.positionType === 'custom') {
              positionType = entry.positionType;
            } else {
              positionType = 'same_as_1';
            }
          } else {
            positionType = 'custom';
          }
        } else {
          positionType = 'custom';
        }
      } else {
        if (position.position === 2) {
          positionType = useSameAs1 ? 'same_as_1' : 'custom';
        } else {
          positionType = 'custom';
        }
      }

      this.allFormData[key] = formValues;
      this.allSelections[key] = positionType;
      this.allPositionTypes[key] = positionType;
    });

    positionsToShow.forEach(position => {
      const key = `${position.position}-${position.subPosition}`;
      this.formGroups[key] = this.createFormGroup(this.allFormData[key]);
      this.itemPreSelections[key] = this.allSelections[key];
      this.positionTypes[key] = this.allPositionTypes[key];
      const formGroup = this.formGroups[key];
      const positionType = this.itemPreSelections[key];

      if (formGroup) {
        if (positionType === 'custom') {
          formGroup.enable();
        } else {
          formGroup.disable();
        }

        if (!this.editMode) {
          formGroup.disable();
        }
      }
    });

    this.formGroups['1-1'].valueChanges.subscribe(value => {
      this.calculationContextService.setProcessInfoForm(this.formGroups['1-1']);
    });
  }

  parseNumber(val: any): number {
    if (typeof val === 'string') {
      return parseFloat(val.replace(/,/g, ''));
    }
    return typeof val === 'number' ? val : 0;
  }


  async saveDraft(): Promise<void> {
    return new Promise((resolve, reject) => {

      const data = this.fetchedData.map((entry) => {
        const key = `${entry.position}-${entry.subPosition}`;

        const form = this.formGroups[key];
        const positionType = this.itemPreSelections[key] || 'custom';

        let value;

        if (positionType === 'custom') {
          value = form.getRawValue();

          form.patchValue({
            gas: this.parseNumber(value.gas),
            condensateValue: this.parseNumber(value.condensateValue),
            cgrValue: this.parseNumber(value.cgrValue),
            waterValue: this.parseNumber(value.waterValue),
            wgrValue: this.parseNumber(value.wgrValue),
            h2s: this.parseNumber(value.h2s),
            co2: this.parseNumber(value.co2),
            exportTemperature: this.parseNumber(value.exportTemperature),
            exportPressure: this.parseNumber(value.exportPressure),
          }, { emitEvent: false });
        }
        else if (positionType === 'same_as_1') {
          const referenceForm = this.formGroups['1-1'];
          if (referenceForm) {
            value = referenceForm.getRawValue();
          }
          else {
            value = form.getRawValue();
          }
        }

        return {
          position: entry.position,
          positionType: positionType,
          subPosition: entry.subPosition,
          flowRate: {
            gas: this.parseNumber(value.gas),
            condensate: {
              type: value.condensateType === 'CGR' ? 'CGR' : 'flowrate',
              value: value.condensateType === 'CGR'
                ? this.parseNumber(value.cgrValue)
                : this.parseNumber(value.condensateValue),
            },
            water: {
              type: value.waterType === 'WGR' ? 'WGR' : 'flowrate',
              value: value.waterType === 'WGR'
                ? this.parseNumber(value.wgrValue)
                : this.parseNumber(value.waterValue),
            },
          },
          composition: {
            h2s: this.parseNumber(value.h2s),
            co2: this.parseNumber(value.co2),
          },
          temperature: {
            export: this.parseNumber(value.exportTemperature),
            pressure: this.parseNumber(value.exportPressure),
          },
        };
      });

      const requestPayload = {
        studyId: this.study?.data?.studyId,
        transactionId: this.transactionId?.data?.transactionId,
        sequenceFlow: this.calculationContextService.getSelectPosition()?.sequenceFlow || '1,2,3,4',
        data,
      };

      this.calculationService.saveDraftProcessInformation(requestPayload).subscribe({
        next: (response) => {
          // this.storeOriginalFormValues();
          // this.editMode = false;
          // this.setFormGroupState(false);
          resolve();
        },
        error: (error) => {
          console.error('Submission error:', error);
          reject(new Error('Something went wrong'));
        },
      });

      this.editMode = false;
      this.setFormGroupState(false);
    });
  }

  private hasInvalidForms(): boolean {
    let invalid = false;
    for (const entry of this.fetchedData) {
      const key = `${entry.position}-${entry.subPosition}`;
      const form = this.formGroups[key];
      if (form?.invalid) {
        form.markAllAsTouched();
        invalid = true;
      }
    }
    return invalid;
  }

  private buildProcessPayload(): any[] {
    return this.fetchedData.map((entry) => {
      const key = `${entry.position}-${entry.subPosition}`;
      const form = this.formGroups[key];
      const positionType = this.itemPreSelections[key] || 'custom';

      let value;
      if (positionType === 'custom') {
        value = form.getRawValue();
      } else if (positionType === 'same_as_1') {
        const referenceForm = this.formGroups['1-1'];
        value = referenceForm ? referenceForm.getRawValue() : form.getRawValue();
      }

      return {
        position: entry.position,
        positionType,
        subPosition: entry.subPosition,
        flowRate: {
          gas: this.parseNumber(value.gas),
          condensate: {
            type: value.condensateType === 'CGR' ? 'CGR' : 'flowrate',
            value:
              value.condensateType === 'CGR'
                ? this.parseNumber(value.cgrValue)
                : this.parseNumber(value.condensateValue),
          },
          water: {
            type: value.waterType === 'WGR' ? 'WGR' : 'flowrate',
            value:
              value.waterType === 'WGR'
                ? this.parseNumber(value.wgrValue)
                : this.parseNumber(value.waterValue),
          },
        },
        composition: {
          h2s: this.parseNumber(value.h2s),
          co2: this.parseNumber(value.co2),
        },
        temperature: {
          export: this.parseNumber(value.exportTemperature),
          pressure: this.parseNumber(value.exportPressure),
        },
      };
    });
  }

  async saveProcessData(): Promise<boolean> {
    if (this.hasInvalidForms()) {
      return false;
    }

    const requestPayload = {
      studyId: this.study?.data?.studyId,
      transactionId: this.transactionId?.data?.transactionId,
      sequenceFlow:
        this.calculationContextService.getSelectPosition()?.sequenceFlow ??
        '1,2,3,4',
      data: this.buildProcessPayload(),
    };

    try {
      await firstValueFrom(
        this.calculationService.saveProcessInformation(requestPayload)
      );
      this.editMode = false;
      this.setFormGroupState(false);
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      const modalTitle = AlertMessageConstants.PROCESS_INFOMATION_SAVE_TITLE_FAILED;
      const modalText = this.alertService.getErrorMessage(error);
      this.alertService.error(modalTitle, modalText, true, 5000);
      return false;
    }
  }


  onSelectionChange(key: string, selection: string): void {
    this.itemPreSelections[key] = selection;
    this.positionTypes[key] = selection;
    this.allSelections[key] = selection;
    this.allPositionTypes[key] = selection;
    this.calculationContextService.setPosition(this.itemPreSelections);
  }

  getProcessInformation(studyId: string, transactionId: string): void {
    this.calculationService.getProcessInformationById(studyId, transactionId).subscribe({
      next: (res) => {
        const apiSequenceFlow = res.data?.sequenceFlow;
        const contextSequenceFlow = this.calculationContextService.getSelectPosition()?.sequenceFlow;

        this.sequenceFlow = contextSequenceFlow ?? apiSequenceFlow ?? '1,2,3,4';

        let data = res.data?.data ?? [];
        data = data.sort((a: any, b: any) => {
          if (a.position === b.position) {
            return a.subPosition - b.subPosition;
          }
          return a.position - b.position;
        });
        this.fetchedData = data;
        if (data.length > 0) {
          if (!this.calculationDataService.processData) {
            this.mapFetchedDataToForm(data);
            this.storeOriginalFormValues();
            this.calculationContextService.setProcessInfoForm(this.formGroups);
            this.calculationContextService.setProcessForm(this.formGroups);
            this.calculationContextService.setPosition(this.itemPreSelections);
            this.validateProcessInformation();
            this.watchFormChanges();
          } else {
            const merged = data.map((a: any) => {
              const found = this.calculationDataService.processData.find(
                (b: any) =>
                  b.position === a.position &&
                  b.subPosition === a.subPosition
              );

              return found ? { ...a, ...found } : a;
            });
            this.mapFetchedDataToForm(merged);
            this.editMode = this.calculationDataService.processMode;
            this.setFormGroupState(this.calculationDataService.processMode);
          }
        } else {
          if (!this.calculationDataService.processData) {
            this.initializeDefaultForm();
            this.storeOriginalFormValues();
          } else {
            this.mapFetchedDataToForm(this.calculationDataService.processData);
            this.editMode = this.calculationDataService.processMode;
            this.setFormGroupState(this.calculationDataService.processMode);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load process information:', err);
        if (!this.calculationDataService.processData) {
          this.initializeDefaultForm();
          this.storeOriginalFormValues();
        } else {
          this.mapFetchedDataToForm(this.calculationDataService.processData);
          this.editMode = this.calculationDataService.processMode;
          this.setFormGroupState(this.calculationDataService.processMode);
        }
      }
    });
  }

  get isAllFormsValid(): boolean {
    if (!this.fetchedData.length || !this.formGroups) {
      return false;
    }

    return this.fetchedData.every((entry) => {
      const key = `${entry.position}`;
      const formGroup = this.formGroups[key];
      const type = this.itemPreSelections[key];

      if (type === 'custom') {
        return formGroup && formGroup.valid;
      }
      return true;
    });
  }

  validateProcessInformation(): {
    isFormPosition1Invalid: boolean;
    isFormPosition2Invalid: boolean;
    isFormPosition3Invalid: boolean;
  } {
    const isFormPosition1Invalid = this.formGroups['1-1']?.invalid ?? false;
    const isFormPosition2Invalid = this.formGroups['2-1']?.invalid ?? false;
    const isFormPosition3Invalid = this.formGroups['2-2']?.invalid ?? false;

    const resValid = {
      isFormPosition1Invalid,
      isFormPosition2Invalid,
      isFormPosition3Invalid,
    };

    this.calculationContextService.setProcessValid(resValid);
    return resValid;
  }


  onCondensateTypeChange(positionKey: string, selectedValue: string): void {
    const formGroup = this.formGroups[positionKey];

    if (selectedValue === 'Condensate Flowrate') {
      formGroup.get('condensateValue')?.setValue(this.defaultFormValues.condensateValue);
    } else if (selectedValue === 'CGR') {
      formGroup.get('cgrValue')?.setValue(this.defaultFormValues.cgrValue);
    }
  }


  onWaterTypeChange(positionKey: string, selectedValue: string): void {
    const formGroup = this.formGroups[positionKey];

    if (selectedValue === 'Water Flowrate') {
      formGroup.get('waterValue')?.setValue(this.defaultFormValues.waterValue);
    } else if (selectedValue === 'WGR') {
      formGroup.get('wgrValue')?.setValue(this.defaultFormValues.wgrValue);
    }
  }
  watchFormChanges(): void {
    Object.keys(this.formGroups).forEach(key => {
      this.formGroups[key].valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      ).subscribe(value => {
        this.allFormData[key] = value;
      });
    });
  }

  getPositionKey(position: number, subPosition: number): string {
    return `${position}-${subPosition}`;
  }

  getSelectedOption(positionKey: string): IdName | null {
    const selectedId = this.itemPreSelections[positionKey];
    return this.dropdownOptions.find(opt => opt.id === selectedId) || null;
  }

  onDropdownSelectionChange(selected: IdName, positionKey: string): void {
    this.itemPreSelections[positionKey] = selected.id;
    this.positionTypes[positionKey] = selected.id === 'custom' ? 'custom' : selected.id;

    const formGroup = this.formGroups[positionKey];
    if (formGroup) {
      selected.id === 'custom' ? formGroup.enable() : formGroup.disable();
    }
  }

  getDropdownLabel(value: string, index: number): string {
    switch (value) {
      case 'same_as_1':
        return 'Same as position 1';
      case 'custom':
        return 'Custom';
      default:
        return 'Custom';
    }
  }

  public setFormGroupState(enabled: boolean) {
    Object.values(this.formGroups).forEach((form) => {
      enabled ? form.enable() : form.disable();
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.setFormGroupState(this.editMode);
    this.interacted.emit();
  }

  getFormControl(formGroup: FormGroup, controlName: string): FormControl {
    const control = formGroup.get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' not found in form group`);
    }
    return control as FormControl;
  }

  getFieldError(control: FormControl | null, min: number, max: number): string {
    if (!control) {
      return '';
    }

    if (!(control.dirty || control.touched)) {
      return '';
    }

    if (control.errors?.['required']) {
      return 'Required field';
    }

    if (control.errors?.['invalidNumber']) {
      return 'Must be a valid number';
    }

    if (control.errors?.['min']) {
      return `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
    }

    if (control.errors?.['max']) {
      return `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
    }

    if (control.errors && Object.keys(control.errors).length > 0) {
      return 'Invalid value';
    }

    return '';
  }

  isOwner(): boolean {
    if (this.hasFullAccess) {
      return true;
    }
    return this.Owner === this.createdBy || !this.createdBy;
  }

  private storeOriginalFormValues(): void {
    this.originalFormValues = {};
    Object.keys(this.formGroups).forEach(key => {
      this.originalFormValues[key] = { ...this.formGroups[key].value };
    });
  }

  toggleViewMode(): void {
    Object.keys(this.formGroups).forEach(key => {
      if (this.originalFormValues[key]) {
        this.formGroups[key].patchValue(this.originalFormValues[key]);
        this.formGroups[key].markAsUntouched();

        Object.keys(this.formGroups[key].controls).forEach(controlName => {
          this.formGroups[key].get(controlName)?.disable();
        });
      }
    });
    this.editMode = false;
  }

  isRadioDisabled(): boolean {
    return !this.editMode;
  }

  scrollIntoView() {
    this.innerDiv.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  private async setDefaultCo2Value(studyId?: string, transactionId?: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.calculationService.getModelCompositonById(studyId, transactionId)
      );

      const co2Value = response.data?.compositions
        ?.find((c: TableComposition) => c.name === 'CO2')
        ?.value;

      this.defaultFormValues.co2 = co2Value ?? 50;

      Object.values(this.formGroups).forEach(fg =>
        fg.get('co2')?.setValue(this.defaultFormValues.co2)
      );
    } catch (error) {
      console.error('Failed to fetch default CO2 value, using fallback', error);
      this.defaultFormValues.co2 = 50;
    }
  }
}