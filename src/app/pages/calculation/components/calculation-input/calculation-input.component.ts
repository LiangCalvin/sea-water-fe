import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PositionSelectorComponent } from './position-selector/position-selector.component';
import { ProcessInformationComponent } from './process-information/process-information.component';
import { PipingDataComponent } from './piping-data/piping-data.component';
import { PipesimComponent } from './pipesim/pipesim.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { ThermowellComponent } from './thermowell/thermowell.component';
import { ErosionComponent } from './erosion/erosion.component';
import { MappingPipesimMessageError, MessagePipesim } from '../../../../core/enums/error.enum';
import { StepComponentWithUnsavedChanges } from '../../../../core/models/calculation/step-unsave-changes.model';
@Component({
  selector: 'app-calculation-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProcessInformationComponent,
    PipingDataComponent,
    PipesimComponent,
    ThermowellComponent,
    ErosionComponent,
    PositionSelectorComponent,
  ],
  templateUrl: './calculation-input.component.html',
  styleUrl: './calculation-input.component.scss',
  standalone: true,
})
export class CalculationInputComponent implements StepComponentWithUnsavedChanges {
  @ViewChild(ProcessInformationComponent)
  processComponent!: ProcessInformationComponent;
  @ViewChild(PipingDataComponent) pipingComponent!: PipingDataComponent;
  @ViewChild(PipesimComponent) pipesimComponent!: PipesimComponent;
  @ViewChild(ThermowellComponent) thermowellComponent!: ThermowellComponent;
  @ViewChild(ErosionComponent) erosionComponent!: ErosionComponent;
  @ViewChild('pipingData', { read: ElementRef }) pipingDataRef!: ElementRef;
  @ViewChild('processInfo', { read: ElementRef }) processInfoRef!: ElementRef;

  @Output() backStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() isLoading = new EventEmitter<boolean>();
  @Input() sequenceFlow: string = '1,2,3,4';
  @Output() stepInteracted = new EventEmitter<boolean>();
  @Output() formChanged = new EventEmitter<boolean>();

  nozzleLengths: { [key: string]: number | null } = {};
  readonly THERMOWELL_AND_EROSION_SEQUENCE_FLOWS = [
    '1,2,3,4',
    '1,2,3',
    '1,3,4',
    '1,3',
  ];
  readonly PIPESIM_SEQUNCES_FLOWS = ['1,2,3,4', '1,3,4', '1,4'];
  private hasInteracted = false;

  constructor(
    private readonly alertService: AlertService
  ) { }
  
  hasUnsavedChanges(): boolean {
    return this.hasInteracted;
  }

  resetInteractionState?(): void {
    this.hasInteracted = false;
  }

  onChildInteracted(): void {
    this.hasInteracted = true;
  }

  onUserInteraction() {
    this.stepInteracted.emit(true);
  }

  onFormChange() {
    this.formChanged.emit(true);
  }

  async onSaveDraft(): Promise<void> {
    try {
      await this.processComponent.saveDraft();
      await this.pipingComponent.saveDraft();

      if (
        this.THERMOWELL_AND_EROSION_SEQUENCE_FLOWS.includes(this.sequenceFlow)
      ) {
        await this.thermowellComponent.saveDraft();
        await this.erosionComponent.saveDraft();
      }

      if (this.PIPESIM_SEQUNCES_FLOWS.includes(this.sequenceFlow)) {
        await this.pipesimComponent.saveDraft();
      }
      this.alertService.success(
        AlertMessageConstants.SAVE_SUCCESS_TITLE,
        AlertMessageConstants.SAVE_DRAFT_SUCCESS_TEXT,
        true,
        3000,
      );
    } catch (error) {
      this.alertService.error(
        AlertMessageConstants.SAVE_FAILED_TITLE,
        AlertMessageConstants.SAVE_FAILED_TEXT,
        true,
        3000,
      );
    }
  }

  async onSaveDraftStepper(): Promise<void> {
    try {
      await this.processComponent.saveDraft();
      await this.pipingComponent.saveDraft();

      if (
        this.THERMOWELL_AND_EROSION_SEQUENCE_FLOWS.includes(this.sequenceFlow)
      ) {
        await this.thermowellComponent.saveDraft();
        await this.erosionComponent.saveDraft();
      }

      if (this.PIPESIM_SEQUNCES_FLOWS.includes(this.sequenceFlow)) {
        await this.pipesimComponent.saveDraft();
      }
    } catch (error) {
      console.log("error: ", error)
    }
  }


  async onNextStep(): Promise<void> {
    const errors: string[] = [];
    let textError: string = '';

    const processOk = await this.processComponent.saveProcessData();
    if (!processOk) errors.push('process');

    const pipingOk = await this.pipingComponent.savePipingData();
    if (!pipingOk) errors.push('piping');

    if (this.THERMOWELL_AND_EROSION_SEQUENCE_FLOWS.includes(this.sequenceFlow)) {
      const thermowellOk = await this.thermowellComponent.saveThermowellData();
      if (!thermowellOk) errors.push('thermowell');

      const erosionOk = await this.erosionComponent.saveErosionData();
      if (!erosionOk) errors.push('erosion');
    }

    if (this.PIPESIM_SEQUNCES_FLOWS.includes(this.sequenceFlow)) {
      const pipesimOk = await this.pipesimComponent.submit();
      if (typeof pipesimOk === 'boolean') {
        if (!pipesimOk) {
          errors.push('pipesim');
        }
      }
      else {
        errors.push(`${pipesimOk}`);
        const pipesimMessage = errors[0] as MessagePipesim;
        textError = this.displayPipeSimError(pipesimMessage);
      }

    }

    if (errors.includes('process')) return this.onScrollToProcessInfoForSubmit();
    if (errors.includes('piping')) return this.onScrollToPipingForSubmit();
    if (errors.includes('erosion')) return this.onScrollToErosionForSubmit();
    if (errors.includes('thermowell')) return this.onScrollToThermowell();
    if (errors.includes('pipesim')) return this.onScrollToPipesim();

    if (errors.length === 0) {
      this.nextStep.emit();
      this.alertService.success(
        AlertMessageConstants.SAVE_SUCCESS_TITLE,
        AlertMessageConstants.SAVE_SUCCESS_TEXT,
        true,
        3000,
      );
    } else {
      this.alertService.error(
        AlertMessageConstants.SAVE_FAILED_TITLE,
        textError,
        true,
        5000,
      );
    }
  }


  async onBackStep(): Promise<void> {
    this.backStep.emit();
  }

  onScrollToPipingData() {
    this.pipingDataRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  onScrollToProcessInfo() {
    this.processInfoRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  onScrollToProcessInfoForSubmit() {
    this.alertService.error(
      AlertMessageConstants.PROCESS_INFOMATION_VALID_TITLE,
      AlertMessageConstants.PROCESS_INFOMATION_VALID_TEXT,
      true,
      5000,
    );
    this.processComponent.scrollIntoView();
  }

  onScrollToPipingForSubmit() {
    this.alertService.error(
      AlertMessageConstants.PIPING_DATA_VALID_TITLE,
      AlertMessageConstants.PIPING_DATA_VALID_TEXT,
      true,
      5000,
    );
    this.pipingComponent.scrollIntoView();
  }

  onScrollToErosionForSubmit() {
    this.alertService.error(
      AlertMessageConstants.EROSION_VALID_TITLE,
      AlertMessageConstants.EROSION_VALID_TEXT,
      true,
      5000,
    );
    this.erosionComponent.scrollIntoView();
  }

  onScrollToThermowell() {
    this.alertService.error(
      AlertMessageConstants.THERMORWELL_VALID_TITLE,
      AlertMessageConstants.THERMORWELL_VALID_TEXT,
      true,
      5000,
    );
    this.thermowellComponent.scrollIntoView();
  }

  onScrollToPipesim() {
    this.alertService.error(
      AlertMessageConstants.PIPESIM_VALID_TITLE,
      AlertMessageConstants.PIPESIM_VALID_TEXT,
      true,
      5000,
    );
    this.pipesimComponent.scrollIntoView();
  }

  onNozzleLengthsChanged(lengths: { [key: string]: number | null }) {
    const nozzle1_1 = lengths['1-1'];
  }

  onLoading(isLoading: boolean) {
    this.isLoading.emit(isLoading);
  }

  displayPipeSimError(code: MessagePipesim): string {
    return MappingPipesimMessageError[code] ?? '';
  }
}
