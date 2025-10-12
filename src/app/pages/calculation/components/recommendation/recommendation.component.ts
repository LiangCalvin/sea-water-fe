import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { RecommendationSummaryComponent } from "./component/recommendation-summary/recommendation-summary.component";
import { CalculationService } from '../../../../services/calculation/calculation.service';
import { CommonService } from '../../../../services/common/common.service';
import { StudyDetailsService } from '../../../../services/study-details/study-details.service';
import { UserNameService } from '../../../../shared/services/user-name.service';
import { Router } from '@angular/router';
import { AlertMessageStudyConstants } from '../../../../core/enums/all-studies.enum';
import { AlertService } from '../../../../shared/services/alert.service';
import { firstValueFrom } from 'rxjs';
import { AlertMessageConstants } from '../../../../core/enums/calculation.enum';
import { TooltipComponent } from "../../../../shared/components/tooltip/tooltip.component";

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, ButtonComponent, NgTemplateOutlet, NzStepsModule, NzPopoverModule, RecommendationSummaryComponent, TooltipComponent],
  templateUrl: './recommendation.component.html',
  styleUrl: './recommendation.component.scss'
})
export class RecommendationComponent {
  @Output() backStep = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() stepInteracted = new EventEmitter<boolean>();
  @ViewChild('resultData', { read: ElementRef }) resultRef!: ElementRef;
  activeTab: 'recommend' | 'details' = 'recommend';
  current: number = 1;
  calStatus: string = 'PROCESSING';
  calState: string = 'RESULT_SUMMARY';
  isProcess: boolean = true;
  mainText: string = 'System is processing your calculation.';
  text: string = 'Please return later to review the results.';
  statusHysys: any = '';
  statusPipseim: any = '';
  study: any;
  transaction: any;
  dataTopSide: any;
  dataPipeLine: any;
  dataProcess: any;
  dataThermowell:any;
  studyDetail: any;
  private intervalId: any;
  @ViewChild('iconSuccess', { static: true }) iconSuccess!: TemplateRef<any>;
  @ViewChild('iconInprogress', { static: true }) iconInprogress!: TemplateRef<any>;

  constructor(
    private calculationService: CalculationService,
    private commonService: CommonService,
    private studyDetailsService: StudyDetailsService,
    private userNameService: UserNameService,
    private router: Router,
    private alertService: AlertService
  ) {

  }

  ngOnInit() {
    const getStudy: any = sessionStorage.getItem('study');
    const getTransaction: any = sessionStorage.getItem('transactionId')
    this.study = JSON.parse(getStudy)
    this.transaction = JSON.parse(getTransaction)
    this.getStudyById();
    this.getCalculationStep();
    // NOTE: WILL USE IN FUTURE
    // this.stepInteracted.emit(true);
  }

  getStepIcon(title: string): string {
    switch (title) {
      case 'HYSYS':
        return this.statusHysys;
      case 'PIPSEIM':
        return this.statusPipseim;
      case 'Finish Calculation':
        return '';
      default:
        return '';
    }
  }

  async getCalculationStepInterVal(intervalId: any) {
    try {
      const response = await firstValueFrom(
        this.commonService.getHandleStep(this.transaction?.data?.transactionId)
      );
  
      if (response?.data) {
        this.calStatus = response?.data?.status;
        this.calState = response?.data?.transactionStep;
  
        const sequenceFlow: string[] = response.data.sequenceFlow?.split(',') || [];

        if (
          this.calState === 'RESULT_SUMMARY' &&
          (this.calStatus === 'DONE' || this.calStatus === 'FAILED') &&
          this.intervalId
        ) {
          await this.getSummaryTopSide();
          if (sequenceFlow.includes('4')) {
            await this.getSummaryPipeLine();
          }
          await this.getProcessInformation();
          await this.getThermowell();
          clearInterval(intervalId);
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async getCalculationStep(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.commonService.getHandleStep(this.transaction?.data?.transactionId)
      );
      if (response?.data) {
        this.calStatus = response?.data?.status;
        this.calState = response?.data?.transactionStep;

        const sequenceFlow: string[] = response.data.sequenceFlow?.split(',') || [];

        if (response.data.status === 'DONE' && response.data.transactionStep === 'RESULT_SUMMARY') {
          await this.getSummaryTopSide();
          if (sequenceFlow.includes('4')) {
            await this.getSummaryPipeLine();
          }
          await this.getProcessInformation();
          await this.getThermowell();
        } else {
          this.intervalId = setInterval(() => {
            this.getCalculationStepInterVal(this.intervalId);
          }, 60000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  getStudyById() {
    this.studyDetailsService.getStudyById(this.study.data.studyId).subscribe(async (response: any) => {
      try {
        if (response.data) {
          this.studyDetail = {
            studyId: response.data.studyId,
            studyCode: response.data.studyCode,
            studyName: response.data.studyName,
            assetName: response.data.asset,
            locationName: response.data.location,
            status: response.data.status,
            createdBy: response.data.createdBy,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt
          }
        }
      } catch (error) {
        console.log("error :", error);
      }
    });
  }

  async getSummaryTopSide() {
    try {
      const response = await firstValueFrom(
        this.calculationService.getSummaryTopSide(
          this.study?.data?.studyId,
          this.transaction?.data?.transactionId
        )
      );
  
      if (response) {
        this.dataTopSide = response.data;
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async getSummaryPipeLine() {
    try {
      const response = await firstValueFrom(
        this.calculationService.getSummaryPipesim(
          this.study?.data?.studyId,
          this.transaction?.data?.transactionId
        )
      );
  
      if (response) {
        this.dataPipeLine = response.data;
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async getProcessInformation() {
    try {
      const response = await firstValueFrom(
        this.calculationService.getProcessInformationById(
          this.study?.data?.studyId,
          this.transaction?.data?.transactionId
        )
      );
  
      if (response) {
        this.dataProcess = response.data;
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async getThermowell() {
    try {
      const response = await firstValueFrom(
        this.calculationService.getThermowellData(
          this.study?.data?.studyId,
          this.transaction?.data?.transactionId
        )
      );
  
      if (response) {
        this.dataThermowell = response.data;
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async onNextStep(): Promise<void> {
    // NOTE: WILL USE IN FUTURE
    // this.stepInteracted.emit(true);
    this.nextStep.emit();
  }

  async onBackStep(): Promise<void> {
    // NOTE: WILL USE IN FUTURE
    // this.stepInteracted.emit(true);
    this.backStep.emit();
  }

  displayName(name: string) {
    return this.userNameService.displayName(name);
  }

  onScrollTop() {
    this.resultRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onRecalculation() {
    // NOTE: WILL USE IN FUTURE
    // this.stepInteracted.emit(true);
    const req = {
      transactionId: this.transaction?.data?.transactionId
    }
    this.studyDetailsService.reCalculation(req).subscribe({
      next: (response) => {
        if (response.data) {
          const study = {
            data: {
              studyId: this.studyDetail.studyId,
              studyCode: this.studyDetail.studyCode
            }
          }
          const transactionData = {
            data: {
              transactionId: response.data.transactionId
            }
          };
          sessionStorage.setItem('transactionId', JSON.stringify(transactionData));
          sessionStorage.setItem('study', JSON.stringify(study));
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/calculation', this.studyDetail.studyCode]);
            // window.location.reload();
          });
        }
      },
      error: (error) => {
        const modalTitle = AlertMessageConstants.RECALCULATE_FAILED_TITLE;
        const modalText = AlertMessageConstants.RECALCULATE_FAILED_TEXT;
        this.alertService.error(modalTitle, modalText, true, 3000);
      }
    });
  }

  onExport() {
    // NOTE: WILL USE IN FUTURE
    // this.stepInteracted.emit(true);
    this.calculationService.getExportSummary(this.study?.data?.studyId, this.transaction?.data?.transactionId).subscribe({
      next: (response) => {
        if (response.data) {
          this.downloadExcel(response.data.data, response.data.filename);
        }
      },
      error: (error) => {
        const modalTitle = AlertMessageConstants.EXPORT_FILE_FAILED_TITLE;
        const modalText = AlertMessageConstants.EXPORT_FILE_FAILED_TEXT;
        this.alertService.error(modalTitle, modalText, true, 3000);
      }
    });
  }

  downloadExcel(base64Data: string, fileName: string = 'report.xlsx') {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(link.href);
  }

  onBackToHome() {
    this.router.navigate(['/all-studies']);
    sessionStorage.clear();
  }

}
