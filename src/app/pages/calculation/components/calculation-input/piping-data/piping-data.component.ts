import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { DropdownComponent } from "../../../../../shared/components/dropdown/dropdown.component";
import { IdName } from '../../../../../shared/models/id-name.model';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, firstValueFrom, merge, skip, startWith, Subject, takeUntil } from 'rxjs';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { CalculationContextService } from '../../../CalculationContext.service';
import { InputTextComponent } from '../../../../../shared/components/input-text/input-text.component';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { AlertMessageConstants } from '../../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../../shared/services/alert.service';
import { CalculationDataService } from '../../../services/calculation-data.service';

@Component({
  selector: 'app-piping-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzGridModule,
    DropdownComponent,
    CollapseComponent,
    InputTextComponent,
    NzButtonModule,
    NzToolTipModule
  ],
  templateUrl: './piping-data.component.html',
  styleUrl: './piping-data.component.scss',
  standalone: true
})
export class PipingDataComponent {
  @Output() sizeChanged = new EventEmitter<number>();
  @Output() nozzleLengthsChange = new EventEmitter<{ [key: string]: number | null }>();
  @ViewChild('innerDiv', { read: ElementRef }) innerDiv!: ElementRef;
  @Output() interacted = new EventEmitter<void>();

  expanded = true;
  formGroups: { [key: string]: FormGroup } = {};
  itemPreSelections: { [key: string]: string } = {};
  positionTypes: { [key: string]: string } = {};
  sequenceFlow = '1,2,3,4';
  fetchedData: any[] = [];
  unitOptions: IdName[] = [
    { id: 'inch', name: 'inch' },
    { id: 'mm', name: 'mm' }
  ];
  dropdownOptions: IdName[] = [
    { id: 'same_as_1', name: 'Same as Production Manifold' },
    { id: 'custom', name: 'Custom' }
  ];
  spanTypeOptions = [
    { id: 'stiff', name: 'Stiff' },
    { id: 'medium_stiff', name: 'Medium Stiff' },
    { id: 'medium', name: 'Medium' },
    { id: 'flexible', name: 'Flexible' },
    { id: 'custom', name: 'Custom' }
  ];
  materialOptions = [
    { id: 'carbon_steel', name: 'Carbon Steel' },
    { id: 'stainless_steel', name: 'Stainless Steel' },
    { id: 'duplex_ss', name: 'Duplex SS' }
  ];
  pipingSizeOptions: IdName[] = [];
  pipingClassOptions: IdName[] = [];
  isLoadingPipingDetails: { [key: string]: boolean } = {};
  isLoadingQualityFactor: { [key: string]: boolean } = {};
  isLoadingAllowableStress: { [key: string]: boolean } = {};
  isLoadingPipingSize = false;
  isLoadingPipingClass = false;

  studyCode: string = '';
  study: any;
  transactionId: any;
  nozzleLengths: { [key: string]: number | null } = {};
  private pipingGrades: { [key: string]: string } = {};
  isPipingReady = false;

  private readonly defaultFormValues = {
    pipingSize: null,
    pipingClass: '',
    innerDiameter: null,
    innerDiameterUnit: this.unitOptions[0],
    outerDiameter: null,
    outerDiameterUnit: 'inch',
    thickness: null,
    thicknessUnit: 'mm',
    material: '',
    erosionVelocityConstant: 130,
    specNo: '',
    maxOperatingTemp: null,
    allowableStress: null,
    coefficient: 0.4,
    qualityFactor: 1,
    corrosionAllowance: null,
    weldingJointStrength: 1.0,
    spanType: 'stiff',
    spanLength: null,
    pipelineDesignPressure: 77,
    actualThickness: null,
    nozzleLength: null
  };

  private readonly destroy$ = new Subject<void>();
  private allFormData: { [key: string]: any } = {};
  private allSelections: { [key: string]: string } = {};
  private allPositionTypes: { [key: string]: string } = {};
  private customFormValues: { [key: string]: any } = {};

  private readonly defaultPositions = [
    { position: 1, subPosition: 1 },
    { position: 1, subPosition: 2 },
    { position: 2, subPosition: 1 },
    { position: 2, subPosition: 2 },
    { position: 3, subPosition: 1 }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly calculationService: CalculationService,
    private readonly calculationContextService: CalculationContextService,
    private readonly calculationDataService: CalculationDataService,
    private readonly alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadSessionData();
    this.observeSequenceFlowChanges();
    this.pipingSizeOptions = [
      { id: '1', name: '1"' },
      { id: '2', name: '2"' },
      { id: '3', name: '3"' },
      { id: '4', name: '4"' },
      { id: '6', name: '6"' },
    ];

    // Mock piping class options
    this.pipingClassOptions = [
      { id: 'class1', name: 'Class 1' },
      { id: 'class2', name: 'Class 2' },
      { id: 'class3', name: 'Class 3' },
    ];
    Promise.all([
      this.loadPipingSizeOptions(),
      this.loadPipingClassOptions()
    ]).then(() => {
      if (this.study?.data?.studyId) {
        this.getPipingDataById(this.study?.data?.studyId, this.transactionId?.data?.transactionId);
      } else {
        this.initializeDefaultForm();
      }
    });
    this.isPipingReady = true;

  }

  ngOnDestroy() {
    const buildBaseData = (pos: { position: number; subPosition: number }) => {
      const key = `${pos.position}-${pos.subPosition}`;

      let base = this.fetchedData.find(d =>
        d.position === pos.position && d.subPosition === pos.subPosition
      );

      if (!base && this.calculationDataService.pipingData?.length) {
        base = this.calculationDataService.pipingData.find((d: { position: number; subPosition: number }) =>
          d.position === pos.position && d.subPosition === pos.subPosition
        );
      }


      return { key, base: base || {} };
    };

    const data = this.defaultPositions.map(pos => {
      const { key, base } = buildBaseData(pos);
      const rawValue = this.formGroups[key]?.getRawValue?.() || {};

      return {
        ...base,
        ...rawValue,
        position: pos.position,
        subPosition: pos.subPosition,
        positionType: this.positionTypes[key] ?? base.positionType
      };
    });

    const dataTypeCustom = this.defaultPositions.map((pos, index) => {
      const { key } = buildBaseData(pos);
      return {
        ...this.calculationDataService.pipingTypeCustomData ? this.calculationDataService.pipingTypeCustomData[index] : this.customFormValues[key],
        ...this.customFormValues[key],
        position: pos.position,
        subPosition: pos.subPosition,
        positionType: this.customFormValues[key] ? 'custom' : this.positionTypes[key]
      };
    });

    this.calculationDataService.pipingData = data;
    this.calculationDataService.pipingTypeCustomData = dataTypeCustom;

    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadSessionData() {
    this.study = JSON.parse(sessionStorage.getItem('study') ?? '{}');
    this.transactionId = JSON.parse(sessionStorage.getItem('transactionId') ?? '{}');
  }

  private observeSequenceFlowChanges(): void {
    this.calculationContextService.selectPosition$
      .pipe(
        takeUntil(this.destroy$),
        filter(position => position !== null),
        distinctUntilChanged((prev, curr) => prev?.sequenceFlow === curr?.sequenceFlow)
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
    const source = this.calculationDataService.pipingData ? 'pipingData' : 'allFormData';
    this.rebuildFormsForSequenceFlow(source);
  }

  private preserveCurrentFormData(): void {
    Object.keys(this.formGroups).forEach(key => {
      if (this.formGroups[key]) {
        this.allFormData[key] = this.formGroups[key].value;
        this.allSelections[key] = this.itemPreSelections[key];
        this.allPositionTypes[key] = this.positionTypes[key];
        if (this.itemPreSelections[key] === 'custom') {
          this.customFormValues[key] = { ...this.formGroups[key].getRawValue() };
        }
      }
    });
  }

  private rebuildFormsForSequenceFlow(source: 'allFormData' | 'pipingData'): void {
    this.formGroups = {};
    this.itemPreSelections = {};
    this.positionTypes = {};
    const positionsToShow = this.getPositionsForSequenceFlow(this.sequenceFlow);

    positionsToShow.forEach((position, index) => {
      const key = `${position.position}-${position.subPosition}`;
      let defaultType = (position.position === 1) ? 'custom' : 'same_as_1';

      const sourceData =
        source === 'allFormData'
          ? this.allFormData[key]
          : this.calculationDataService.pipingData?.[index];

      if (sourceData) {
        this.formGroups[key] = this.createFormGroup(sourceData);

        const existingSelection =
          source === 'allFormData'
            ? this.allSelections[key]
            : sourceData.positionType;

        const existingPositionType =
          source === 'allFormData'
            ? this.allPositionTypes[key]
            : sourceData.positionType;

        if (position.position === 2 || position.position === 3) {
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
          this.itemPreSelections[key] = existingSelection || defaultType;
          this.positionTypes[key] = existingPositionType || defaultType;
        }
        this.setupSpanLengthValidation(this.formGroups[key]);
      } else {
        this.formGroups[key] = this.createFormGroup(this.defaultFormValues);
        this.itemPreSelections[key] = defaultType;
        this.positionTypes[key] = defaultType;
        this.allFormData[key] = this.defaultFormValues;
        this.allSelections[key] = defaultType;
        this.allPositionTypes[key] = defaultType;
        this.setupSpanLengthValidation(this.formGroups[key]);
      }
    });

    this.applyPositionTypeLogic();

    this.calculationContextService.setPipingForm(this.formGroups);
    this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
    this.validatePipingData();
    this.watchFormChanges();
  }

  private applyPositionTypeLogic(): void {
    Object.keys(this.formGroups).forEach((key) => {
      const formGroup = this.formGroups[key];
      const positionType = this.itemPreSelections[key];
      if (positionType === 'same_as_1') {
        const referenceFormGroup = this.formGroups['1-1'];
        if (referenceFormGroup) {
          formGroup.patchValue(referenceFormGroup.getRawValue());
        }
        Object.keys(formGroup.controls).forEach(controlName => {
          formGroup.get(controlName)?.disable();
        });
      } else if (positionType === 'custom') {
        Object.keys(formGroup.controls).forEach(controlName => {
          formGroup.get(controlName)?.enable();
        });
        if (this.customFormValues[key]) {
          formGroup.patchValue(this.customFormValues[key]);
        }
      }
    });
  }


  private initializeDefaultForm(): void {
    const sequenceFlow = this.calculationContextService.getSelectPosition()?.sequenceFlow ?? this.sequenceFlow;
    const positionsToShow = this.getPositionsForSequenceFlow(sequenceFlow);
    this.fetchedData = positionsToShow;
    this.formGroups = {};
    this.defaultPositions.forEach((position) => {
      const key = this.getItemKey(position);
      this.formGroups[key] = this.createFormGroup(this.defaultFormValues);
      const isPosition1_1 = position.position === 1 && position.subPosition === 1;
      const isPosition1_2 = position.position === 1 && position.subPosition === 2;
      const isPosition2_1 = position.position === 2 && position.subPosition === 1;
      const isPosition2_2 = position.position === 2 && position.subPosition === 2;
      const isPosition3_1 = position.position === 3 && position.subPosition === 1;
      this.itemPreSelections[key] =
        isPosition1_1 ? 'custom' :
          isPosition1_2 ? 'same_as_1' :
            isPosition2_1 ? 'same_as_1' :
              isPosition2_2 ? 'same_as_1' :
                isPosition3_1 ? 'same_as_1' :
                  'custom';
      this.positionTypes[key] = this.itemPreSelections[key];
      this.onItemOptionChange(key, this.itemPreSelections[key]);
      this.formGroups['1-1'].get('pipingClass')?.patchValue('F 70');
      this.formGroups['1-1'].get('pipingSize')?.patchValue(8);
    });
    this.formGroups['1-1'].valueChanges.subscribe(value => {
      this.calculationContextService.setPipingForm(this.formGroups['1-1']);
    });
    this.setupAllPipingDataWatchers();
    this.validatePipingData();
    this.watchFormChanges();
    this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
  }

  private getPositionsForSequenceFlow(sequenceFlow: string): any[] {
    const positions = sequenceFlow.split(',').map(pos => parseInt(pos.trim()));
    return this.defaultPositions.filter(pos => {
      if (pos.position === 1) {
        return true;
      }
      return positions.includes(pos.position);
    });
  }

  private createFormGroup(values: any): FormGroup {
    return this.fb.group({
      pipingSize: [values.pipingSize, [Validators.required, Validators.min(0)]],
      pipingClass: [values.pipingClass, Validators.required],
      innerDiameter: [values.innerDiameter, [Validators.required, Validators.min(0)]],
      innerDiameterUnit: [values.innerDiameterUnit],
      outerDiameter: [values.outerDiameter, [Validators.required]],
      outerDiameterUnit: [values.outerDiameterUnit],
      thickness: [values.thickness],
      thicknessUnit: [values.thicknessUnit],
      material: [values.material, Validators.required],
      erosionVelocityConstant: [values.erosionVelocityConstant, [Validators.required, Validators.min(0)]],
      specNo: [values.specNo, Validators.required],
      maxOperatingTemp: [values.maxOperatingTemp, [Validators.required, Validators.min(0)]],
      allowableStress: [values.allowableStress, [Validators.required, Validators.min(0)]],
      coefficient: [values.coefficient, [Validators.required, Validators.min(0)]],
      qualityFactor: [values.qualityFactor, [Validators.required, Validators.min(0)]],
      corrosionAllowance: [values.corrosionAllowance, [Validators.min(0)]],
      weldingJointStrength: [values.weldingJointStrength, [Validators.required, Validators.min(0)]],
      spanType: [values.spanType, Validators.required],
      spanLength: [values.spanLength],
      pipelineDesignPressure: [values.pipelineDesignPressure, [Validators.required, Validators.min(0)]],
      actualThickness: [values.actualThickness, [Validators.required, Validators.min(0)]],
      nozzleLength: null
    });
  }

  private setupSpanLengthValidation(formGroup: FormGroup): void {
    const spanTypeControl = formGroup.get('spanType');
    const spanLengthControl = formGroup.get('spanLength');
    if (spanTypeControl && spanLengthControl) {
      spanTypeControl.valueChanges.subscribe(spanType => {
        if (spanType === 'custom') {
          spanLengthControl.setValidators([Validators.required]);
        } else {
          spanLengthControl.setValidators([]);
        }
        spanLengthControl.updateValueAndValidity();
      });
      if (spanTypeControl.value === 'custom') {
        spanLengthControl.setValidators([Validators.required]);
      } else {
        spanLengthControl.setValidators([]);
      }
      spanLengthControl.updateValueAndValidity();
    }
  }

  getItemKey(item: { position: number; subPosition: number }): string {
    return `${item.position}-${item.subPosition}`;
  }

  getPipingDataById(studyId: string, transactionId: string): void {
    this.calculationService.getPipingDataById(studyId, transactionId).subscribe({
      next: (res) => {
        const apiSequenceFlow = res.data?.sequenceFlow;
        const contextSequenceFlow = this.calculationContextService.getSelectPosition()?.sequenceFlow;
        this.sequenceFlow = contextSequenceFlow ?? apiSequenceFlow ?? '1,2,3,4';

        const data = res.data ?? [];

        if (data.length > 0) {
          const sortedData = data.sort((a: any, b: any) => {
            if (a.position !== b.position) {
              return a.position - b.position;
            }
            return a.subPosition - b.subPosition;
          });
          const allowedPositions = this.sequenceFlow.split(',').map(p => parseInt(p.trim()));
          const filteredData = sortedData.filter((entry: any) => {
            if (entry.position === 1) return true;
            return allowedPositions.includes(entry.position);
          });

          if (!this.calculationDataService.pipingData) {
            this.mapFetchedDataToForm(filteredData);

            Object.keys(this.formGroups).forEach(key => {
              const formGroup = this.formGroups[key];
              const pipingSize = formGroup.get('pipingSize')?.value;
              const pipingClass = formGroup.get('pipingClass')?.value;
              const needFetch =
                !formGroup.get('innerDiameter')?.value &&
                !formGroup.get('outerDiameter')?.value &&
                !formGroup.get('thickness')?.value;

              if (pipingSize && pipingClass && needFetch) {
                this.calculationService.getPipingDetailByClassAndSize(pipingClass, pipingSize).subscribe({
                  next: (res) => {
                    if (res?.data) {
                      this.updateFormWithPipingDetails(key, res.data, false);

                      if (res.data.grade) {
                        this.pipingGrades[key] = res.data.grade;
                      }
                    }
                  },
                  error: (err) => console.error('Error fetching piping details:', err)
                });
              }
            });
          } else {
            const merged = filteredData.map((a: any) => {
              const found = this.calculationDataService.pipingData.find(
                (b: any) =>
                  b.position === a.position &&
                  b.subPosition === a.subPosition
              );

              return found ? { ...a, ...found } : a;
            });
            this.mapFetchedDataToForm(merged, true);
          }
          this.calculationContextService.setPipingForm(this.formGroups);
          this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
          this.validatePipingData();
          this.watchFormChanges();
          // this.initPipingDetailsForForms();
          this.isPipingReady = true;
        } else {
          if (!this.calculationDataService.pipingData) {
            this.initializeDefaultForm();
          } else {
            this.mapFetchedDataToForm(this.calculationDataService.pipingData, true);
          }
          this.isPipingReady = true;
        }
      },
      error: (err) => {
        this.initializeDefaultForm();
        this.isPipingReady = true;
      }
    });
  }

  private mapFetchedDataToForm(data: any[], isTemp: boolean = false): void {
    this.fetchedData = data;
    this.formGroups = {};
    data.forEach((entry, index) => {
      const key = `${entry.position}-${entry.subPosition}`;
      if (entry.grade) {
        this.pipingGrades[key] = entry.grade;
      }
      const formValues = {
        ...this.defaultFormValues,
        pipingSize: entry.pipingSize ?? this.defaultFormValues.pipingSize,
        pipingClass: entry.pipingClass ?? this.defaultFormValues.pipingClass,

        innerDiameter: isTemp
          ? entry.innerDiameter ?? this.defaultFormValues.innerDiameter
          : entry.innerDiameter?.value ?? this.defaultFormValues.innerDiameter,

        innerDiameterUnit: isTemp
          ? entry.innerDiameterUnit ?? this.defaultFormValues.innerDiameterUnit
          : entry.innerDiameter?.unit ?? this.defaultFormValues.innerDiameterUnit,

        outerDiameter: isTemp
          ? entry.outerDiameter ?? this.defaultFormValues.outerDiameter
          : entry.outerDiameter?.value ?? this.defaultFormValues.outerDiameter,

        outerDiameterUnit: isTemp
          ? entry.outerDiameterUnit ?? this.defaultFormValues.outerDiameterUnit
          : entry.outerDiameter?.unit ?? this.defaultFormValues.outerDiameterUnit,

        thickness: isTemp
          ? entry.thickness ?? this.defaultFormValues.thickness
          : entry.thickness?.value ?? this.defaultFormValues.thickness,

        thicknessUnit: isTemp
          ? entry.thicknessUnit ?? this.defaultFormValues.thicknessUnit
          : entry.thickness?.unit ?? this.defaultFormValues.thicknessUnit,

        material: entry.material ?? this.defaultFormValues.material,
        erosionVelocityConstant: entry.erosionVelocityConstant ?? this.defaultFormValues.erosionVelocityConstant,
        specNo: entry.specNo ?? this.defaultFormValues.specNo,
        maxOperatingTemp: entry.maxOperatingTemp ?? this.defaultFormValues.maxOperatingTemp,
        allowableStress: entry.allowableStress ?? this.defaultFormValues.allowableStress,
        coefficient: entry.coefficient ?? this.defaultFormValues.coefficient,
        qualityFactor: entry.qualityFactor ?? this.defaultFormValues.qualityFactor,
        corrosionAllowance: entry.corrosionAllowance ?? this.defaultFormValues.corrosionAllowance,
        weldingJointStrength: entry.weldingJointStrength ?? this.defaultFormValues.weldingJointStrength,
        spanType: entry.spanType ?? this.defaultFormValues.spanType,
        spanLength: entry.spanLength ?? this.defaultFormValues.spanLength,
        pipelineDesignPressure: entry.pipelineDesignPressure ?? this.defaultFormValues.pipelineDesignPressure,
        actualThickness: entry.actualThickness ?? this.defaultFormValues.actualThickness,
        nozzleLength: entry.nozzleLength ?? null
      };

      if (key === '1-1') {
        this.nozzleLengthsChange.emit({ '1-1': entry.nozzleLength ?? null });
      }

      this.formGroups[key] = this.createFormGroup(formValues);
      this.setupSpanLengthValidation(this.formGroups[key]);

      const positionType = entry.positionType ?? (index === 0 ? 'custom' : 'same_as_1');
      this.itemPreSelections[key] = positionType;
      this.positionTypes[key] = positionType;
    });
    this.setupAllPipingDataWatchers();
    this.formGroups['1-1'].valueChanges.subscribe(value => {
      this.calculationContextService.setPipingForm(this.formGroups['1-1']);
    });
    this.validatePipingData();
    this.watchFormChanges();
    this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
  }

  getSelectedOption(positionKey: string): IdName | null {
    const selectedId = this.itemPreSelections[positionKey];
    return this.dropdownOptions.find(opt => opt.id === selectedId) || null;
  }

  getPositionKey(position: number, subPosition: number): string {
    return `${position}-${subPosition}`;
  }

  onDropdownSelectionChange(selected: IdName, positionKey: string): void {
    const formGroup = this.formGroups[positionKey];
    if (!formGroup) return;
    if (this.itemPreSelections[positionKey] === 'custom' && selected.id === 'same_as_1') {
      this.customFormValues[positionKey] = { ...formGroup.getRawValue() };
    }
    this.itemPreSelections[positionKey] = selected.id;
    this.positionTypes[positionKey] = selected.id;
    if (selected.id === 'custom') {
      formGroup.enable();
      if (!this.calculationDataService.pipingData) {
        if (this.customFormValues[positionKey]) {
          formGroup.patchValue(this.customFormValues[positionKey]);
        } else {
          formGroup.patchValue({
            pipingSize: 10,
            pipingClass: 'F 03S',
            innerDiameter: null,
            innerDiameterUnit: 'inch',
            outerDiameter: null,
            outerDiameterUnit: 'inch',
            thickness: null,
            thicknessUnit: 'mm',
            material: '',
            erosionVelocityConstant: 130,
            specNo: '',
            maxOperatingTemp: null,
            allowableStress: null,
            coefficient: 0.4,
            qualityFactor: 1,
            corrosionAllowance: null,
            weldingJointStrength: 1.0,
            spanType: 'stiff',
            spanLength: null,
            pipelineDesignPressure: 77,
            actualThickness: null
          });
        }
        this.setupPipingDataWatcher(positionKey);
      } else {
        const pipingDataMap: { [key: string]: any } = this.calculationDataService.pipingTypeCustomData.reduce((acc: { [x: string]: any; }, item: { position: number; subPosition: number; }) => {
          const key = `${item.position}-${item.subPosition}`;
          acc[key] = item;
          return acc;
        }, {} as { [key: string]: any });
        formGroup.patchValue(pipingDataMap[positionKey]);
      }
    } else if (selected.id === 'same_as_1') {
      const referenceForm = this.formGroups['1-1'];
      if (referenceForm) {
        formGroup.patchValue(referenceForm.getRawValue());
      }
      formGroup.disable();
    }
    this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
    this.formGroups['1-2'].valueChanges.subscribe(value => {
      this.calculationContextService.setPipingForm(this.formGroups['1-2']);
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
      const referenceGrade = this.pipingGrades['1-1'] ?? null;

      const data = this.fetchedData.map((item) => {
        const key = this.getItemKey(item);
        const form = this.formGroups[key];
        const positionType = this.itemPreSelections[key] || 'custom';
        let value;
        if (positionType === 'custom' || (item.position === 1 && item.subPosition === 1)) {
          value = form.getRawValue();
        } else {
          const referenceForm = this.formGroups['1-1'];
          value = referenceForm ? referenceForm.getRawValue() : form.getRawValue();
        }
        const extractUnit = (unitValue: any): string => {
          if (typeof unitValue === 'string') {
            return unitValue;
          }
          if (unitValue && typeof unitValue === 'object' && unitValue.id) {
            return unitValue.id;
          }
          return unitValue || '';
        };
        const grade =
          positionType === 'same_as_1'
            ? referenceGrade
            : this.pipingGrades[key] ?? null;

        return {
          position: item.position,
          subPosition: item.subPosition,
          positionType: positionType,
          pipingSize: this.parseNumber(value.pipingSize),
          pipingClass: value.pipingClass,
          grade,
          innerDiameter: {
            value: this.parseNumber(value.innerDiameter),
            unit: extractUnit(value.innerDiameterUnit)
          },
          outerDiameter: {
            value: this.parseNumber(value.outerDiameter),
            unit: extractUnit(value.outerDiameterUnit)
          },
          thickness: {
            value: this.parseNumber(value.thickness),
            unit: extractUnit(value.thicknessUnit)
          },
          material: value.material,
          erosionVelocityConstant: this.parseNumber(value.erosionVelocityConstant),
          specNo: value.specNo,
          maxOperatingTemp: this.parseNumber(value.maxOperatingTemp),
          allowableStress: this.parseNumber(value.allowableStress),
          coefficient: this.parseNumber(value.coefficient),
          qualityFactor: this.parseNumber(value.qualityFactor),
          corrosionAllowance: this.parseNumber(value.corrosionAllowance),
          weldingJointStrength: this.parseNumber(value.weldingJointStrength),
          pipelineDesignPressure: this.parseNumber(value.pipelineDesignPressure),
          actualThickness: this.parseNumber(value.actualThickness),
          spanType: value.spanType,
          spanLength: value.spanType === 'custom'
            ? this.parseNumber(value.spanLength)
            : 0
        };
      });
      const requestPayload = {
        studyId: this.study?.data?.studyId,
        transactionId: this.transactionId?.data?.transactionId,
        sequenceFlow: this.calculationContextService.getSelectPosition()?.sequenceFlow ?? '1,2,3,4',
        data,
      };
      this.calculationService.saveDraftPipingData(requestPayload).subscribe({
        next: (response) => {
          resolve();
        },
        error: (error) => {
          console.error('Submission error:', error);
          reject(new Error('Something went wrong'));
        },
      });
    });
  }

  onItemOptionChange(position: string, selectedOption: string) {
    const currentForm = this.formGroups[position];
    const currentValues = currentForm?.getRawValue();
    const current = this.itemPreSelections[position];

    if (current !== selectedOption) {
      this.interacted.emit();
    }
    this.itemPreSelections[position] = selectedOption;
    this.positionTypes[position] = selectedOption;
    const targetForm = this.formGroups[position];
    const referenceForm = this.formGroups['1-1'];
    if (!targetForm) return;
    if (selectedOption === 'custom') {
      if (currentValues) {
        targetForm.patchValue(currentValues);
      }
      targetForm.enable();
      this.setupPipingDataWatcher(position);
    } else {
      if (selectedOption === 'same_as_1' && referenceForm) {
        const refValues = referenceForm.getRawValue();
        targetForm.patchValue(refValues);
      }
      targetForm.disable();
    }
    this.calculationContextService.setPositionTypePiping(this.itemPreSelections);
  }

  private hasInvalidForms(): boolean {
    let isInvalid = false;
    for (const entry of this.fetchedData) {
      const key = `${entry.position}-${entry.subPosition}`;
      const form = this.formGroups[key];
      const positionType = this.itemPreSelections[key] || 'custom';

      if (positionType === 'custom' && form?.invalid) {
        form.markAllAsTouched();
        isInvalid = true;
      }
    }
    return isInvalid;
  }


  private buildPipingPayload(): any[] {
    const referenceGrade = this.pipingGrades['1-1'] ?? null;

    return this.fetchedData.map((item) => {

      const key = this.getItemKey(item);
      const form = this.formGroups[key];
      const positionType =
        this.itemPreSelections[key] || 'custom';
      let value;
      if (
        positionType === 'custom' ||
        (item.position === 1 && item.subPosition === 1)
      ) {
        value = form.getRawValue();
      } else {
        const referenceForm = this.formGroups['1-1'];
        value = referenceForm ? referenceForm.getRawValue() : form.getRawValue();
      }
      const extractUnit = (unitValue: any): string => {
        if (typeof unitValue === 'string') {
          return unitValue;
        }
        if (unitValue && typeof unitValue === 'object' && unitValue.id) {
          return unitValue.id;
        }
        return unitValue || '';
      };

      const grade =
        positionType === 'same_as_1'
          ? referenceGrade
          : this.pipingGrades[key] ?? null;


      return {
        position: item.position,
        subPosition: item.subPosition,
        positionType,
        pipingSize: this.parseNumber(value.pipingSize),
        pipingClass: value.pipingClass,
        grade,
        innerDiameter: {
          value: this.parseNumber(value.innerDiameter),
          unit: extractUnit(value.innerDiameterUnit)
        },
        outerDiameter: {
          value: this.parseNumber(value.outerDiameter),
          unit: extractUnit(value.outerDiameterUnit),
        },
        thickness: {
          value: this.parseNumber(value.thickness),
          unit: extractUnit(value.thicknessUnit),
        },
        material: value.material,
        erosionVelocityConstant: this.parseNumber(value.erosionVelocityConstant),
        specNo: value.specNo,
        maxOperatingTemp: this.parseNumber(value.maxOperatingTemp),
        allowableStress: this.parseNumber(value.allowableStress),
        coefficient: this.parseNumber(value.coefficient),
        qualityFactor: this.parseNumber(value.qualityFactor),
        corrosionAllowance: this.parseNumber(value.corrosionAllowance),
        weldingJointStrength: this.parseNumber(value.weldingJointStrength),
        pipelineDesignPressure: this.parseNumber(value.pipelineDesignPressure),
        actualThickness: this.parseNumber(value.actualThickness),
        spanType: value.spanType,
        spanLength:
          value.spanType === 'custom'
            ? this.parseNumber(value.spanLength)
            : 0,
      };
    });
  }

  async savePipingData(): Promise<boolean> {
    if (this.hasInvalidForms()) {
      return false;
    }

    const requestPayload = {
      studyId: this.study?.data?.studyId,
      transactionId: this.transactionId?.data?.transactionId,
      sequenceFlow:
        this.calculationContextService.getSelectPosition()?.sequenceFlow ??
        '1,2,3,4',
      data: this.buildPipingPayload(),
    };
    try {
      await firstValueFrom(
        this.calculationService.savePipingData(requestPayload)
      );
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      const modalTitle = AlertMessageConstants.PIPING_SAVE_TITLE_FAILED;
      const modalText = this.alertService.getErrorMessage(error);
      this.alertService.error(modalTitle, modalText, true, 5000);
      return false;
    }
  }

  private setupAllPipingDataWatchers(): void {
    Object.keys(this.formGroups).forEach(key => {
      this.setupAllowableStressWatcher(key);
    });
  }

  private setupPipingDataWatcher(key: string): void {
    const formGroup = this.formGroups[key];
    if (!formGroup) return;
    const pipingSize$ = formGroup.get('pipingSize')!.valueChanges.pipe(
      startWith(formGroup.get('pipingSize')!.value),
      debounceTime(500),
      distinctUntilChanged()
    );
    const pipingClass$ = formGroup.get('pipingClass')!.valueChanges.pipe(
      startWith(formGroup.get('pipingClass')!.value),
      debounceTime(500),
      distinctUntilChanged()
    );
    const specNo$ = formGroup.get('specNo')!.valueChanges.pipe(
      startWith(formGroup.get('specNo')!.value),
      debounceTime(500),
      distinctUntilChanged()
    );
    const temperature$ = formGroup.get('maxOperatingTemp')!.valueChanges.pipe(
      startWith(formGroup.get('maxOperatingTemp')!.value),
      debounceTime(100),
      distinctUntilChanged()
    );
    combineLatest([pipingSize$, pipingClass$]).subscribe(([size, pipingClass]) => {
      if (size && pipingClass) {
        this.fetchPipingDetails(key, pipingClass, size, false);
      }
    });
    combineLatest([specNo$, pipingClass$]).subscribe(([specNo, pipingClass]) => {
      if (specNo && pipingClass) {
        this.fetchQualityFactor(key, specNo, pipingClass);
      }
    });
  }

  private setupAllowableStressWatcher(key: string) {
    const formGroup = this.formGroups[key];
    if (!formGroup) return;
    const specNo$ = formGroup.get('specNo')!.valueChanges.pipe(
      startWith(formGroup.get('specNo')!.value),
      // debounceTime(300),
      distinctUntilChanged()
    );
    const temperature$ = formGroup.get('maxOperatingTemp')!.valueChanges.pipe(
      startWith(formGroup.get('maxOperatingTemp')!.value),
      // debounceTime(100),
      distinctUntilChanged()
    );
    const grade$ = new BehaviorSubject(this.pipingGrades[key]);
    const originalUpdate = this.updateFormWithPipingDetails.bind(this);

    this.updateFormWithPipingDetails = (keyParam: string, data: any, isUserChange = false) => {
      if (data.grade !== undefined) {
        this.pipingGrades[keyParam] = data.grade;
        if (keyParam === key) {
          grade$.next(data.grade);
        }
      }
      originalUpdate(keyParam, data, isUserChange);
    };
    combineLatest([specNo$, temperature$, grade$]).pipe(
      filter(([specNo, temp, grade]) => !!specNo && temp != null && grade != null),
      skip(1)
    ).subscribe(([specNo, temp, grade]) => {
      this.fetchAllowableStress(key, specNo, temp, grade);
    });
  }

  private fetchPipingDetails(key: string, pipingClass: string, size: number, isUserChange = true): void {
    this.isLoadingPipingDetails[key] = true;
    this.calculationService.getPipingDetailByClassAndSize(pipingClass, size).subscribe({
      next: (response) => {
        this.isLoadingPipingDetails[key] = false;
        this.updateFormWithPipingDetails(key, response.data, isUserChange);
        if (key === '1-1' && response.data?.nozzleLength !== undefined) {
          this.nozzleLengths[key] = response.data.nozzleLength;
          this.nozzleLengthsChange.emit({ '1-1': response.data.nozzleLength });
        }
      },
      error: (error) => {
        this.isLoadingPipingDetails[key] = false;
        console.error('Error fetching piping details:', error);
      }
    });
  }

  private fetchQualityFactor(key: string, specNo: string, pipingClass: string): void {
    this.calculationService.getQualityFactor(specNo, pipingClass).subscribe({
      next: (res) => {
        const formGroup = this.formGroups[key];
        if (formGroup && res?.data?.qualityFactor !== undefined) {
          formGroup.patchValue({ qualityFactor: res.data.qualityFactor });
        }
      },
      error: (err) => console.error('Error fetching quality factor:', err)
    });
  }

  private fetchAllowableStress(key: string, specNo: string, temperature: number, grade: string): void {
    this.calculationService.getAllowableStress(specNo, temperature, grade).subscribe({
      next: (res) => {
        const formGroup = this.formGroups[key];
        if (formGroup && res?.data?.allowableStress !== undefined) {
          formGroup.patchValue({ allowableStress: res.data.allowableStress });
        }
      },
      error: (err) => console.error('Error fetching allowable stress:', err)
    });
  }

  private updateFormWithPipingDetails(key: string, data: any, isUserChange = false): void {
    const formGroup = this.formGroups[key];
    if (!formGroup || !data) return;
    if (data.innerDiameter) {
      formGroup.patchValue({
        innerDiameter: data.innerDiameter.value,
        innerDiameterUnit: data.innerDiameter.unit
      });
    }
    if (data.outerDiameter) {
      formGroup.patchValue({
        outerDiameter: data.outerDiameter.value,
        outerDiameterUnit: data.outerDiameter.unit
      });
    }
    if (data.thickness) {
      formGroup.patchValue({
        thickness: data.thickness.value,
        thicknessUnit: data.thickness.unit
      });
    }
    if (data.specNo) {
      const currentSpecNo = formGroup.get('specNo')?.value;
      if (isUserChange || !currentSpecNo) {
        formGroup.patchValue({ specNo: data.specNo });
      }
    }
    if (data.material) {
      formGroup.patchValue({
        material: data.material
      });
    }
    if (data.corrosionAllowance) {
      formGroup.patchValue({
        corrosionAllowance: data.corrosionAllowance
      });
    }
    if (data.nozzleLength !== undefined) {
      formGroup.patchValue({
        nozzleLength: data.nozzleLength
      });
    }
    if (data.grade !== undefined) {
      this.pipingGrades[key] = data.grade;
    }
  }
  // NOTE: Need for State in Future
  // private initPipingDetailsForForms(): void {
  //   Object.keys(this.formGroups).forEach(key => {
  //     const formGroup = this.formGroups[key];
  //     const size = formGroup.get('pipingSize')?.value;
  //     const pipingClass = formGroup.get('pipingClass')?.value;

  //     if (size && pipingClass) {
  //       this.fetchPipingDetails(key, pipingClass, size);
  //     }
  //   });
  // }

  getUnitOption(id: string | null): IdName | null {
    return this.unitOptions.find(u => u.id === id) || this.unitOptions[0];
  }

  getUnitOptions(validIds: string[]): IdName[] {
    return this.unitOptions.filter(option => validIds.includes(option.id));
  }

  getSpanTypeOption(value: string | null | undefined) {
    return this.spanTypeOptions.find(option => option.id === value) || null;
  }

  getPipingSizeOption(value: string | null | undefined) {
    if (value === null || value === undefined) return null;
    const stringValue = String(value);
    return this.pipingSizeOptions.find(opt => String(opt.id) === stringValue) || null;
  }

  getPipingClassOption(value: string | null | undefined) {
    return this.pipingClassOptions.find(opt => opt.id === value) || null;
  }

  getMaterialOption(value: string | null | undefined) {
    return this.materialOptions.find(opt => opt.id === value) || null;
  }

  onUnitChange(selected: IdName, key: string, field: 'innerDiameterUnit' | 'outerDiameterUnit' | 'thicknessUnit') {
    this.formGroups[key]?.get(field)?.setValue(selected.id);
  }

  onSpanTypeChange(selectedOption: { id: string; name: string }, itemKey: string) {
    this.formGroups[itemKey].get('spanType')?.setValue(selectedOption.id);
  }

  onMaterialChange(selected: IdName, key: string): void {
    const control = this.formGroups[key].get('material');
    if (control) {
      control.setValue(selected.id);
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  onRadioSelectionChange(selectedId: string, positionKey: string): void {
    this.itemPreSelections[positionKey] = selectedId;
    this.positionTypes[positionKey] = selectedId;
    const formGroup = this.formGroups[positionKey];
    if (formGroup) {
      selectedId === 'custom' ? formGroup.enable() : formGroup.disable();
    }
  }

  onPipingSizeChange(selected: IdName, key: string): void {
    const control = this.formGroups[key].get('pipingSize');
    const pipingClassControl = this.formGroups[key].get('pipingClass');
    if (control) {
      control.setValue(selected.id);
      control.markAsDirty();
      control.markAsTouched();
    }
    const pipingClass = pipingClassControl?.value;
    const pipingSize = parseFloat(selected.id);
    if (pipingClass && pipingSize) {
      this.fetchPipingDetails(key, pipingClass, pipingSize, true);
    }
  }

  onPipingClassChange(selected: IdName, key: string): void {
    const pipingClassControl = this.formGroups[key].get('pipingClass');
    const pipingSizeControl = this.formGroups[key].get('pipingSize');
    if (pipingClassControl) {
      pipingClassControl.setValue(selected.id);
      pipingClassControl.markAsDirty();
      pipingClassControl.markAsTouched();
    }
    const pipingSize = pipingSizeControl?.value;
    if (selected.id && pipingSize) {
      const size = parseFloat(pipingSize);
      this.fetchPipingDetails(key, selected.id, size, true);
    }
  }

  watchFormChanges(): void {
    const formPosition1 = this.formGroups['1-1'];
    const formPosition2 = this.formGroups['1-2'];
    const formPosition3 = this.formGroups['2-1'];
    merge(
      formPosition1?.valueChanges ?? EMPTY,
      formPosition2?.valueChanges ?? EMPTY,
      formPosition3?.valueChanges ?? EMPTY
    ).subscribe(() => {
      this.validatePipingData();
    });
  }

  validatePipingData(): {
    isFormPosition1Invalid: boolean;
    isFormPosition2Invalid: boolean;
    isFormPosition3Invalid: boolean;
  } {
    const isFormPosition1Invalid = this.formGroups['1-1']?.invalid ?? false;
    const isFormPosition2Invalid = this.formGroups['1-2']?.invalid ?? false;
    const isFormPosition3Invalid = this.formGroups['2-1']?.invalid ?? false;

    const resValid = {
      isFormPosition1Invalid,
      isFormPosition2Invalid,
      isFormPosition3Invalid,
    };

    this.calculationContextService.setPipingValid(resValid);
    return resValid;
  }


  getFormControl<T = any>(formGroup: FormGroup, controlName: string): FormControl<T> {
    const control = formGroup.get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' not found in form group`);
    }
    return control as FormControl<T>;
  }

  getFieldError(control: FormControl<any> | null, min?: number | null, max?: number | null): string {
    if (!control || !(control.dirty || control.touched)) return '';
    if (control.errors?.['required']) {
      return 'Required field';
    }

    if (control.errors?.['min'] || control.errors?.['max']) {
      return `Must be number and between ${min?.toLocaleString()} and ${max?.toLocaleString()}`;
    }

    return '';
  }

  getWarning(control: FormControl<any> | null, min?: number, max?: number): string {
    if (!control) return '';
    const value = control.value;
    if (value != null && (value < min! || value > max!)) {
      return `Unable to calculate LOF. Please ensure Outer Diameter is within the valid range (${min}–${max} mm)`;
    }
    return '';
  }
  getDropdownOptions(i: number): IdName[] {
    const item = this.fetchedData[i];
    if (!item) {
      return [
        { id: 'same_as_1', name: 'Same as position 1' },
        { id: 'custom', name: 'Custom' }
      ];
    }
    if (item.position === 1 && item.subPosition === 2) {
      return [
        { id: 'same_as_1', name: 'Same as Production Manifold' },
        { id: 'custom', name: 'Custom' }
      ];
    }
    if ((item.position === 2) || (item.position === 3)) {
      return [
        { id: 'same_as_1', name: 'Same as Export Manifold' },
        { id: 'custom', name: 'Custom' }
      ];
    }
    return [
      { id: 'same_as_1', name: 'Same as position 1' },
      { id: 'custom', name: 'Custom' }
    ];
  }

  scrollIntoView() {
    this.innerDiv.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  private async loadPipingSizeOptions(): Promise<void> {
    this.isLoadingPipingSize = true;
    try {
      const response = await this.calculationService.getPipingSize().toPromise();
      if (response?.data?.pipingSize) {
        this.pipingSizeOptions = response.data.pipingSize.map((size: number) => ({
          id: size.toString(),
          name: size.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to load piping size options:', error);
    } finally {
      this.isLoadingPipingSize = false;
    }
  }

  private async loadPipingClassOptions(): Promise<void> {
    this.isLoadingPipingClass = true;
    try {
      const response = await this.calculationService.getPipingClass().toPromise();
      if (response?.data?.pipingClass) {
        this.pipingClassOptions = response.data.pipingClass.map((pipingClass: any) => {
          if (typeof pipingClass === 'string') {
            return { id: pipingClass, name: pipingClass };
          } else if (pipingClass.id && pipingClass.name) {
            return { id: pipingClass.id, name: pipingClass.name };
          } else {
            return { id: pipingClass.toString(), name: pipingClass.toString() };
          }
        });
      }
    } catch (error) {
      console.error('Failed to load piping class options:', error);
    } finally {
      this.isLoadingPipingClass = false;
    }
  }

  onChildInteracted(): void {
    this.interacted.emit();
  }

}