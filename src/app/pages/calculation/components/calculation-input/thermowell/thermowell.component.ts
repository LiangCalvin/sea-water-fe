import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../../../shared/components/input-text/input-text.component';
import { CalculationService } from '../../../../../services/calculation/calculation.service';
import { CalculationContextService } from '../../../CalculationContext.service';
import { IdName } from '../../../../../core/models/calculation/dropdown-option.model';
import { debounceTime, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { TooltipComponent } from "../../../../../shared/components/tooltip/tooltip.component";
import { NzButtonModule } from "ng-zorro-antd/button";
import { AlertMessageConstants } from '../../../../../core/enums/calculation.enum';
import { AlertService } from '../../../../../shared/services/alert.service';
import { CalculationDataService } from '../../../services/calculation-data.service';

@Component({
  selector: 'app-thermowell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollapseComponent,
    InputTextComponent,
    DropdownComponent,
    TooltipComponent,
    NzButtonModule,

  ],
  templateUrl: './thermowell.component.html',
  styleUrl: './thermowell.component.scss'
})
export class ThermowellComponent {
  @Output() scrollToPiping = new EventEmitter<void>();
  @Input() nozzleLength: number | null = null;
  @ViewChild('innerDiv', { read: ElementRef }) innerDiv!: ElementRef;
  @Output() interacted = new EventEmitter<void>();

  expanded = true;
  form!: FormGroup;
  study: any;
  transactionId: any;
  fetchedData: any[] = [];
  isLoadingPipingDetails = false;
  private initialPipingDataHandled = false;

  stemTypeOptions: IdName[] = [
    {
      id: 'straight',
      name: 'Straight'
    },
    {
      id: 'tapered',
      name: 'Tapered'
    },
    {
      id: 'stepped',
      name: 'Stepped'
    }
  ];
  thermowellMaterialOptions: IdName[] = [
    { id: '316l_ss', name: '316L SS' },
    { id: 'super_duplex', name: 'Super Duplex' },
  ];
  connectionTypeOptions: IdName[] = [
    {
      id: 'threaded',
      name: 'Threaded'
    },
    {
      id: 'flange',
      name: 'Flange'
    },
    {
      id: 'welded',
      name: 'Welded'
    },
    {
      id: 'van_stone',
      name: 'Van Stone'
    },

  ]
  private readonly materialYoungModulusMap: { [key: string]: number } = {
    '316l_ss': 187000000000,
    'super_duplex': 191000000000
  };

  private readonly defaultFormValues = {
    pipingSize: 0,
    pipingClass: 0,
    innerDiameter: 0,
    innerDiameterUnit: 'inch',
    thickNess: 0,
    insulationThickness: '0',
    stemType: 'tapered',
    insertionLength: null,
    wellLength: null,
    thermowellMaterial: '316l_ss',
    youngModulus: this.getYoungModulusForMaterial('316l_ss'),
    rootDiameter: 26.5,
    tipDiameter: 18,
    boreDiameter: 6.6,
    avgDiam: 18,
    connectionType: 'flange'
  };
  private readonly pipingSizeRanges: { [key: number]: { min: number; max: number } } = {
    6: { min: 50, max: 100 },
    8: { min: 67, max: 133 },
    10: { min: 83, max: 167 },
    12: { min: 100, max: 200 },
    14: { min: 117, max: 233 },
    16: { min: 133, max: 267 },
    20: { min: 167, max: 333 },
    24: { min: 200, max: 400 },
    28: { min: 233, max: 467 },
    34: { min: 283, max: 567 },
    36: { min: 300, max: 600 },
    42: { min: 350, max: 700 },
    48: { min: 400, max: 800 },
    54: { min: 450, max: 900 }
  };
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly calculationService: CalculationService,
    private readonly calculationContextService: CalculationContextService,
    private readonly alertService: AlertService,
    private readonly calculationDataService: CalculationDataService,

  ) {
  }

  ngOnInit(): void {
    this.loadSessionData();
    if (this.study?.data?.studyId) {
      this.getThermowell(this.study?.data?.studyId, this.transactionId?.data?.transactionId);
    } else {
      this.initializeDefaultForm();
    }
    this.watchFormChanges();
  }

  ngOnDestroy(): void {
    if (!this.form) {
      this.destroy$.next();
      this.destroy$.complete();
      return;
    }

    const data = this.form.getRawValue() ?? {};
    this.calculationDataService.thermowellData = data;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSessionData() {
    this.study = JSON.parse(sessionStorage.getItem('study') ?? '{}');
    this.transactionId = JSON.parse(sessionStorage.getItem('transactionId') ?? '{}');
  }

  getThermowell(studyId: string, transactionId: string): void {
    this.calculationService.getThermowellData(studyId, transactionId).subscribe({
      next: (res) => {
        const data = res.data;
        if (data && Object.keys(data).length > 0) {
          if (!this.calculationDataService.thermowellData) {
            this.mapFetchedDataToForm(data);
          } else {
            this.mapFetchedDataToForm(this.calculationDataService.thermowellData);
          }
        } else {
          if (!this.calculationDataService.thermowellData) {
            this.initializeDefaultForm();
          } else {
            this.mapFetchedDataToForm(this.calculationDataService.thermowellData);
          }
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }
  private setupInsertionLengthWatcher(): void {
    this.form.get('insertionLength')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(insertionLength => {
        const nozzleLength = this.form.get('nozzleLength')?.value ?? null;
        const thickness = this.form.get('thickNess')?.value ?? 0;

        const parsedInsertionLength = this.parseNumber(insertionLength);
        const parsedNozzleLength = this.parseNumber(nozzleLength);
        const parsedThickness = this.parseNumber(thickness);

        const wellLength = parsedInsertionLength + parsedNozzleLength + parsedThickness;

        this.form.get('wellLength')?.patchValue(wellLength, { emitEvent: false });
      });
  }
  private setupNozzleLengthWatcher(): void {
    this.form.get('nozzleLength')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(nozzleLength => {
        const insertionLength = this.form.get('insertionLength')?.value ?? 0;
        const thickness = this.form.get('thickNess')?.value ?? 0;

        const parsedInsertionLength = this.parseNumber(insertionLength);
        const parsedThickness = this.parseNumber(thickness);

        const parsedNozzleLength = this.parseNumber(nozzleLength);
        const wellLength = parsedInsertionLength + parsedNozzleLength + parsedThickness;
        this.form.get('wellLength')?.patchValue(wellLength, { emitEvent: false });
      });
  }
  private mapFetchedDataToForm(data: any): void {
    this.fetchedData = data;
    const materialFromApi = data.thermowellMaterial ?? '316l_ss';
    const calculatedYoungModulus = this.getYoungModulusForMaterial(materialFromApi);
    const nozzleLength = this.parseNumber(data.nozzleLength);

    const formValues = {
      insulationThickness: data.insulationThickness?.toString() ?? null,
      stemType: data.stemType ?? 'tapered',
      insertionLength: data.insertionLength ?? 0,
      wellLength: data.wellLength ?? 0,
      thermowellMaterial: data.thermowellMaterial ?? '316l_ss',
      youngModulus: data.youngModulus ?? calculatedYoungModulus,
      rootDiameter: data.rootDiameter ?? null,
      tipDiameter: data.tipDiameter ?? null,
      boreDiameter: data.boreDiameter ?? null,
      avgDiam: data.avgDiam ?? null,
      connectionType: data.connectionType ?? 'flange',
      pipingSize: 0,
      pipingClass: 0,
      innerDiameter: 0,
      innerDiameterUnit: data.innerDiameterUnit ?? 'inch',
      nozzleLength: nozzleLength,
      thickNess: 0,
    };

    this.form = this.createFormGroup(formValues);
    this.setupMaterialChangeWatcher();
    this.setupInsertionLengthWatcher();
    this.setupNozzleLengthWatcher();
    this.watchFormChanges();
  }

  private initializeDefaultForm(): void {
    this.form = this.createFormGroup(this.defaultFormValues);
    this.setupMaterialChangeWatcher();
    this.setupInsertionLengthWatcher();
    this.setupNozzleLengthWatcher();
    this.watchFormChanges();
  }
  private insertionLengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const numValue = this.parseNumber(control.value);

      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }

      if (!this.form) {
        return null;
      }
      const pipingSize = this.form.get('pipingSize')?.value;
      if (!pipingSize || pipingSize === 0) {
        return null;
      }
      const range = this.pipingSizeRanges[pipingSize];

      if (!range) {
        console.warn(`No range defined for pipingSize: ${pipingSize}`);
        return null;
      }

      if (numValue < range.min) {
        return { min: { actual: numValue, min: range.min } };
      }

      if (numValue > range.max) {
        return { max: { actual: numValue, max: range.max } };
      }

      return null;
    };
  }
  private createFormGroup(values: any): FormGroup {
    return this.fb.group({
      insulationThickness: [values.insulationThickness, Validators.required],
      stemType: [values.stemType || 'tapered'],
      insertionLength: [
        values.insertionLength,
        [Validators.required, this.insertionLengthValidator()]
      ],
      wellLength: [values.wellLength, Validators.required],
      thermowellMaterial: [values.thermowellMaterial ?? '316l_ss', Validators.required],
      youngModulus: [values.youngModulus ?? this.getYoungModulusForMaterial(values.thermowellMaterial ?? '316l_ss'), Validators.required],
      rootDiameter: [values.rootDiameter ?? null, Validators.required],
      tipDiameter: [values.tipDiameter ?? null, Validators.required],
      boreDiameter: [values.boreDiameter || null, Validators.required],
      avgDiam: [values.avgDiam ?? null, Validators.required],
      connectionType: [values.connectionType ?? 'flange'],
      pipingSize: [values.pipingSize ?? 0],
      pipingClass: [values.pipingClass ?? 0],
      innerDiameter: [values.innerDiameter ?? 0],
      innerDiameterUnit: [values.innerDiameterUnit ?? 'inch'],
      nozzleLength: [values.nozzleLength ?? null, Validators.required],
      thickNess: [values.thickNess ?? 0],
    });
  }

  parseNumber(val: any): number {
    if (val === null || val === undefined || val === '') {
      return 0;
    }
    if (typeof val === 'string') {
      return parseFloat(val.replace(/,/g, ''));
    }
    return typeof val === 'number' ? val : 0;
  }

  async saveDraft(): Promise<void> {
    return new Promise((resolve, reject) => {
      const value = this.form.getRawValue();

      const requestPayload = {
        studyId: this.study?.data?.studyId,
        transactionId: this.transactionId?.data?.transactionId,
        insulationThickness: this.parseNumber(value.insulationThickness),
        stemType: typeof value.stemType === 'object' ? value.stemType.id : value.stemType,
        thermowellMaterial: typeof value.thermowellMaterial === 'object' ? value.thermowellMaterial.id : value.thermowellMaterial,
        connectionType: typeof value.connectionType === 'object' ? value.connectionType.id : value.connectionType,
        youngModulus: this.parseNumber(value.youngModulus),
        insertionLength: this.parseNumber(value.insertionLength),
        wellLength: this.parseNumber(value.wellLength),
        rootDiameter: this.parseNumber(value.rootDiameter),
        tipDiameter: this.parseNumber(value.tipDiameter),
        boreDiameter: this.parseNumber(value.boreDiameter),
        avgDiam: this.parseNumber(value.avgDiam),
        nozzleLength: this.parseNumber(value.nozzleLength)
      };

      this.calculationService.saveDraftThermowell(requestPayload).subscribe({
        next: (response) => {
          resolve();
        },
        error: (error) => {
          console.error('Thermowell draft submission failed:', error);
          reject(new Error('Something went wrong'));
        },
      });
    });
  }

  private buildThermowellPayload(value: any) {
    return {
      studyId: this.study?.data?.studyId,
      transactionId: this.transactionId?.data?.transactionId,
      insulationThickness: this.parseNumber(value.insulationThickness),
      stemType:
        typeof value.stemType === 'object' ? value.stemType.id : value.stemType,
      thermowellMaterial:
        typeof value.thermowellMaterial === 'object'
          ? value.thermowellMaterial.id
          : value.thermowellMaterial,
      connectionType:
        typeof value.connectionType === 'object'
          ? value.connectionType.id
          : value.connectionType,
      youngModulus: this.parseNumber(value.youngModulus),
      insertionLength: this.parseNumber(value.insertionLength),
      wellLength: this.parseNumber(value.wellLength),
      rootDiameter: this.parseNumber(value.rootDiameter),
      tipDiameter: this.parseNumber(value.tipDiameter),
      boreDiameter: this.parseNumber(value.boreDiameter),
      avgDiam: this.parseNumber(value.avgDiam),
      nozzleLength: this.parseNumber(value.nozzleLength)
    };
  }

  async saveThermowellData(): Promise<boolean> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    const value = this.form.getRawValue();
    const requestPayload = this.buildThermowellPayload(value);

    try {
      await firstValueFrom(
        this.calculationService.saveThermowellData(requestPayload)
      );
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      const modalTitle = AlertMessageConstants.THERMORWELL_SAVE_TITLE_FAILED;
      const modalText = this.alertService.getErrorMessage(error);
      this.alertService.error(modalTitle, modalText, true, 5000);
      return false;
    }
  }

  validateThermowell(): {
    isFormInvalid: boolean;
  } {
    const isFormInvalid = this.form.invalid ?? false;
  
    const resValid = { isFormInvalid };
  
    this.calculationContextService.setThermowellValid(resValid);
    return resValid;
  }
  

  get isFormValid(): boolean {
    const isValid = this.form ? this.form.valid : false;
    this.calculationContextService.setThermowellValid(isValid);
    return isValid;
  }

  watchFormChanges(): void {
    this.calculationContextService.pipingForm$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe((data: any) => {
        if (!data || !this.form || typeof data.get !== 'function') {
          return;
        }
        const pipingSizeValue = data.get('pipingSize')?.value;
        const currentPipingSize = this.form.get('pipingSize')?.value;
        const nozzleLengthValue = data.get('nozzleLength')?.value;
        const currentNozzleLength = this.form.get('nozzleLength')?.value;
        const finalNozzleLength = (currentNozzleLength && currentNozzleLength !== 0)
          ? currentNozzleLength
          : nozzleLengthValue;

        if (!this.initialPipingDataHandled) {
          this.initialPipingDataHandled = true;

          this.form.patchValue({
            pipingSize: pipingSizeValue,
            pipingClass: data.get('pipingClass')?.value,
            innerDiameter: data.get('innerDiameter')?.value,
            innerDiameterUnit: data.get('innerDiameterUnit')?.value || 'inch',
            nozzleLength: finalNozzleLength,
            thickNess: data.get('thickness')?.value
          }, { emitEvent: false });
          this.calculateAndUpdateWellLength();

          const currentInsertionLength = this.form.get('insertionLength')?.value;
          if (!currentInsertionLength && pipingSizeValue) {
            this.fetchInsertionLenght(pipingSizeValue);
          }

          return;
        }

        this.form.patchValue({
          pipingSize: pipingSizeValue,
          pipingClass: data.get('pipingClass')?.value,
          innerDiameter: data.get('innerDiameter')?.value,
          innerDiameterUnit: data.get('innerDiameterUnit')?.value ?? 'inch',
          nozzleLength: finalNozzleLength,
          thickNess: data.get('thickness')?.value
        }, { emitEvent: true });
        
        if (pipingSizeValue != null && pipingSizeValue !== '' && pipingSizeValue !== currentPipingSize) {
          this.fetchInsertionLenght(pipingSizeValue);
        }
      });

    this.form?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateThermowell();
      });
  }

  public calculateAndUpdateWellLength(): void {
    const insertionLength = this.parseNumber(this.form.get('insertionLength')?.value);
    const nozzleLength = this.parseNumber(this.form.get('nozzleLength')?.value);
    const thickness = this.parseNumber(this.form.get('thickNess')?.value);

    const wellLength = insertionLength + nozzleLength + thickness;

    this.form.get('wellLength')?.patchValue(wellLength, { emitEvent: false });
  }
  getStemTypeOption(value: string | null | undefined) {
    return this.stemTypeOptions.find(opt => opt.id === value) || null;
  }

  getThermowellMaterialOption(value: string | null | undefined) {
    return this.thermowellMaterialOptions.find(option => option.id === value) || null;
  }

  getConnectionTypeOption(value: string | null | undefined) {
    return this.connectionTypeOptions.find(option => option.id === value) || null;
  }

  private getYoungModulusForMaterial(materialId: string): number {
    return this.materialYoungModulusMap[materialId] || 187000000000;
  }

  getItemKey(): string {
    return 'default';
  }

  private setupMaterialChangeWatcher(): void {
    this.form.get('thermowellMaterial')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const materialId = typeof value === 'object' ? value.id : value;
        const newYoungModulus = this.getYoungModulusForMaterial(materialId);
        this.form.get('youngModulus')?.patchValue(newYoungModulus, { emitEvent: false });
      });
  }

  public fetchInsertionLenght(size: number): void {

    if (this.isLoadingPipingDetails) {
      return;
    }

    this.isLoadingPipingDetails = true;
    this.calculationService.getInsertionLengthBySize(size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoadingPipingDetails = false;
          this.updateFormWithThermowellData(response.data);
        },
        error: (error) => {
          this.isLoadingPipingDetails = false;
          console.error('Error fetching piping details:', error);
          this.form.patchValue(
            {
              insertionLength: null,
              wellLength: null
            },
            { emitEvent: false }
          );
        }
      });
  }

  private updateFormWithThermowellData(data: any): void {
    if (!this.form || !data) return;

    const currentValues = this.form.getRawValue();
    const updates: any = {};

    if (data.insertionLength !== currentValues.insertionLength) {
      updates.insertionLength = data.insertionLength ?? null;
    }
    if (data.wellLength !== currentValues.wellLength) {
      updates.wellLength = data.wellLength ?? null;
    }

    if (Object.keys(updates).length > 0) {
      this.form.patchValue(updates, { emitEvent: false });
    }
  }

  getFormControl(form: FormGroup, controlName: string): FormControl {
    const control = form.get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' not found in form group`);
    }
    return control as FormControl;
  }

  getFieldError(control: FormControl | null, fallbackMin?: number, fallbackMax?: number): string {
    if (!control) {
      console.warn('Control is null in getFieldError');
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
      const error = control.errors['min'];
      const min = error.min;
      const max = this.getCurrentMaxForInsertionLength();
      return `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
    }

    if (control.errors?.['max']) {
      const error = control.errors['max'];
      const min = this.getCurrentMinForInsertionLength();
      const max = error.max;
      return `Must be number and between ${min.toLocaleString()} and ${max.toLocaleString()}`;
    }

    if (control.errors && Object.keys(control.errors).length > 0) {
      return 'Invalid value';
    }

    return '';
  }

  private getCurrentMinForInsertionLength(): number {
    const pipingSize = this.form?.get('pipingSize')?.value ?? 0;
    return this.pipingSizeRanges[pipingSize]?.min ?? 0;
  }

  private getCurrentMaxForInsertionLength(): number {
    const pipingSize = this.form?.get('pipingSize')?.value ?? 0;
    return this.pipingSizeRanges[pipingSize]?.max ?? 100;

  }

  get youngModulusFormattedHtml(): string {
    const value = this.form.get('youngModulus')?.value;
    if (value == null) return '';
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10<sup>${exponent}</sup>`;
  }

  scrollIntoView() {
    this.innerDiv.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  shouldDisplayInnerDiameter(): boolean {
    const value = this.form?.get('innerDiameter')?.value;
    return value != null && value !== '' && value !== 0 && typeof value !== 'object';
  }

  getDisplayValue(controlName: string): string | number {
    const value = this.form?.get(controlName)?.value;
    if (typeof value === 'object' && value !== null) {
      return 'Invalid data';
    }
    return value ?? '';
  }

  onChildInteracted(): void {
    this.interacted.emit();
  }

}