import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ProcessInformationReviewComponent } from './process-information-review/process-information-review.component';
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { ActivatedRoute } from '@angular/router';
import { CalculationContextService } from '../../CalculationContext.service';
import { CommonModule } from '@angular/common';
import { PipingDataReviewComponent } from './piping-data-review/piping-data-review.component';
import { ErosionReviewComponent } from './erosion-review/erosion-review.component';
import { ThermowellReviewComponent } from './thermowell-review/thermowell-review.component';
import { PipesimReviewComponent } from './pipesim-review/pipesim-review.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { CalculationDataService } from '../../services/calculation-data.service';
import { StepComponentWithUnsavedChanges } from '../../../../core/models/calculation/step-unsave-changes.model';
import { GlobalTemplateService } from '../../../../services/global-template.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-input-review',
  imports: [
    CommonModule,
    ProcessInformationReviewComponent,
    PipingDataReviewComponent,
    ErosionReviewComponent,
    ThermowellReviewComponent,
    PipesimReviewComponent,
  ],
  templateUrl: './input-review.component.html',
  styleUrl: './input-review.component.scss',
  standalone: true,
})
export class InputReviewComponent implements StepComponentWithUnsavedChanges {
  @Output() backStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() stepInteracted = new EventEmitter<boolean>();
  study: any;
  transactionId: any;
  processData: any[] = [];
  pipingData: any[] = [];
  erosionData: any[] = [];
  thermowellData: any;
  nozzleLength?: number;
  pipesimData: any;
  sequenceFlow: string = '';
  sequenceArray: number[] = [];
  isLoading:boolean = false;
  private hasInteracted = false;

  private templateService = inject(GlobalTemplateService);
  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');
  constructor(
    private calculationService: CalculationService,
    private route: ActivatedRoute,
    private calculationDataService: CalculationDataService,
    private readonly alertService: AlertService,
  ) { }
  hasUnsavedChanges(): boolean {
    return this.hasInteracted;
  }
  resetInteractionState?(): void {
    this.hasInteracted = false;
    this.stepInteracted.emit(false);
  }
  ngOnInit() {
    this.loadSessionData();
    this.stepInteracted.emit(true);
    // this.calculationDataService.resetCalculationData();
    if (this.study?.data?.studyId) {
      this.getProcessInformation(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
      this.getPipingDataById(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
      this.getErosionCalculationData(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
      this.getThermowell(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
      this.getPipesimData(
        this.study?.data?.studyId,
        this.transactionId?.data?.transactionId,
      );
      // this.getPipesimData()
    } else {
      console.log('error');
    }
  }

  // ngOnDestroy() {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  private loadSessionData() {
    this.study = JSON.parse(sessionStorage.getItem('study') || '{}');
    this.transactionId = JSON.parse(
      sessionStorage.getItem('transactionId') || '{}',
    );
  }
  shouldDisplayStep(stepNumber: number): boolean {
    return this.sequenceArray.includes(stepNumber);
  }

  getProcessInformation(studyId: string, transactionId: string): void {
    this.calculationService
      .getProcessInformationById(studyId, transactionId)
      .subscribe({
        next: (res) => {
          let data = res.data?.data ?? [];
          this.sequenceFlow = res.data?.sequenceFlow || '';
          this.sequenceArray = this.sequenceFlow
            .split(',')
            .map((num) => parseInt(num.trim()));

          data = data.sort((a: any, b: any) => {
            if (a.position === b.position) {
              return a.subPosition - b.subPosition;
            }
            return a.position - b.position;
          });
          this.processData = data;
          const gasComp = this.extractGasComposition();
          if (gasComp) {
            this.pipesimData = {
              ...this.pipesimData,
              otherData: {
                ...(this.pipesimData?.otherData ?? {}),
                co2: gasComp.co2,
                h2s: gasComp.h2s,
              },
            };
          }
        },
        error: (err) => {
          console.error('Failed to load process information:', err);
        },
      });
  }
  private extractGasComposition(): { h2s: number; co2: number } | null {
    const target = this.processData.find(
      (item: any) => item.position === 1 && item.subPosition === 1
    );
    return target?.composition
      ? { h2s: target.composition.h2s, co2: target.composition.co2 }
      : null;
  }
  getPipingDataById(studyId: string, transactionId: string): void {
    this.calculationService
      .getPipingDataById(studyId, transactionId)
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];
          if (data.length > 0) {
            // Sort the data by position first, then by subPosition
            const sortedData = data.sort((a: any, b: any) => {
              if (a.position !== b.position) {
                return a.position - b.position;
              }
              return a.subPosition - b.subPosition;
            });
            this.pipingData = sortedData;
            const pipingClass = this.pipingData[0].pipingClass;
            const size = this.pipingData[0].pipingSize;
            this.calculationService
              .getPipingDetailByClassAndSize(pipingClass, size)
              .subscribe({
                next: (detail) => {
                  const nozzleLength = detail.data.nozzleLength;
                  this.pipingData[0] = {
                    ...this.pipingData[0],
                    nozzleLength: nozzleLength,
                  };
                },
                error: (err) =>
                  console.error('Error fetching piping detail', err),
              });
          } else {
            console.warn('No data returned.');
          }
        },
        error: (err) => {
          console.error('Failed to load piping calculation data:', err);
        },
      });
  }

  getErosionCalculationData(studyId: string, transactionId: string): void {
    this.calculationService
      .getErosionCalculationDataById(studyId, transactionId)
      .subscribe({
        next: (res) => {
          const data = res.data;
          if (data) {
            this.erosionData = data;
          } else {
            console.warn('No data returned.');
          }
        },
        error: (err) => {
          console.error('Failed to load erosion calculation data:', err);
        },
      });
  }

  getThermowell(studyId: string, transactionId: string): void {
    this.calculationService
      .getThermowellData(studyId, transactionId)
      .subscribe({
        next: (res) => {
          const data = res.data;
          if (data && Object.keys(data).length > 0) {
            this.thermowellData = data;
          } else {
            console.warn('No data returned. Using default form values.');
          }
        },
        error: (err) => {
          console.error('API Error:', err);
        },
      });
  }

  getPipesimData(studyId: string, transactionId: string) {
    this.calculationService.getPipesimById(studyId, transactionId).subscribe({
      next: (res) => {
        const data = res.data;
        if (data && Object.keys(data).length > 0) {
          this.pipesimData = {
            ...data,
            otherData: {
              ...data.otherData,
              ...this.pipesimData?.otherData
            }
          };
        } else {
          console.warn('No data returned.');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  async submitCalculation(): Promise<void> {
    this.stepInteracted.emit(true);
    this.isLoading = true;
    if (!this.study?.data?.studyId || !this.transactionId?.data?.transactionId) {
      this.alertService.error(
        'Validation Error',
        'Study ID and Transaction ID are required for submission.',
        true,
        5000
      );
      this.isLoading = false;
      return;
    }
  
    const requestBody = {
      studyId: this.study.data.studyId,
      transactionId: this.transactionId.data.transactionId,
    };
  
    try {
       await firstValueFrom(this.calculationService.submitCalculation(requestBody));
  
      this.alertService.success(
        AlertMessageConstants.REVIEW_SUCCESS_TITLE,
        AlertMessageConstants.REVIEW_SUCCESS_TEXT,
        true,
        5000
      );
  
      this.nextStep.emit();
    } catch (error) {
      console.error('Failed to submit calculation:', error);
      this.alertService.error(
        AlertMessageConstants.REVIEW_FAILED_TITLE,
        AlertMessageConstants.REVIEW_FAILED_TEXT,
        true,
        5000
      );
    } finally {
      this.isLoading = false;
    }
  }

  async onBackStep(): Promise<void> {
    this.stepInteracted.emit(true);
    this.backStep.emit();
  }

}
