import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SourServiceComponent } from "../sour-service/sour-service.component";
import { FluidDensityComponent } from "../fluid-density/fluid-density.component";
import { PressureProfileComponent } from "../pressure-profile/pressure-profile.component";
import { ErosionalVelocityComponent } from "../erosional-velocity/erosional-velocity.component";
import { TemperatureProfileComponent } from '../temperature-profile/temperature-profile.component';
import { TagComponent } from "../../../../../../shared/components/tag/tag.component";
import { mappingWakeFrequency, titleSummary, titleSummaryType, wakeFrequencyType } from '../../../../../../core/enums/calculation.enum';
import { OverviewSummaryComponent } from "../overview-summary/overview-summary.component";
import { LineSizingComponent } from '../line-sizing/line-sizing.component';
import { FlowInducedVibrationComponent } from "../flow-induced-vibration/flow-induced-vibration.component";
import { FitForServiceComponent } from "../fit-for-service/fit-for-service.component";
import { WakeFrequencyComponent } from "../wake-frequency/wake-frequency.component";
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
@Component({
  selector: 'app-recommendation-summary',
  imports: [CommonModule, NzIconModule, SourServiceComponent, FluidDensityComponent, PressureProfileComponent, ErosionalVelocityComponent, TemperatureProfileComponent, TagComponent, OverviewSummaryComponent, LineSizingComponent, FlowInducedVibrationComponent, FitForServiceComponent, WakeFrequencyComponent],
  standalone: true,
  templateUrl: './recommendation-summary.component.html',
  styleUrl: './recommendation-summary.component.scss'
})
export class RecommendationSummaryComponent {
  type: string = '';
  title: string = '';
  status: string = 'FALSE';
  verificationText: string = ''
  mainTitle: string = '';
  @Output() scrollToTop = new EventEmitter<void>();
  topSideData: any;
  topSideDetails: any;
  pipeLineData: any;
  pipeLineDetails: any;
  activeTopSideIndex: number | null = null;
  activeTopSideSubIndex: { mainIndex: number, subIndex: number } | null = null;
  activePipeLineIndex: number | null = null;
  activePipeLineSubIndex: { mainIndex: number, subIndex: number } | null = null;
  @Input() dataTopSide: any;
  @Input() dataPipeLine: any;
  @Input() dataProcess: any;
  @Input() dataThermowell: any;


  constructor(private userNameService: UserNameService) { }


  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'dataTopSide':
            this.mappingTopSide();
            break;
          case 'dataPipeLine':
            this.mappingPipeLine();
            break;
          case 'dataProcess':
            this.topSideData?.topside?.results?.forEach((result: any) => {
              result.processInformation = this.dataProcess?.data.find(
                (e: any) => e.position === result.pipingDetail?.position
              );
            });
            break;
          case 'dataThermowell':
            this.topSideData?.topside?.results?.forEach((result: any) => {
              result.thermowell = this.dataThermowell
            });
            break;
        }
      }
    }
    this.setTextDefault();
  }


  onClickOpenDetail(data: any, title: string, index: number) {
    this.title = data.title;
    this.mainTitle = '';
    this.type = data.type;
    this.status = data.failed > 0 ? "FALSE" : "TRUE"
    this.verificationText = title;
    this.activeTopSideIndex = index;
    this.activeTopSideSubIndex = null;
    this.activePipeLineIndex = null;
    this.activePipeLineSubIndex = null;
    this.scrollToTop.emit();

  }

  onClickOpenSubDetail(data: any, mainIndex: number, subIndex: number) {
    this.title = data.title;
    this.mainTitle = data.mainTitle;
    this.type = data.type;
    this.status = data.status
    this.verificationText = this.topSideData?.topside?.title || 'Topside Verification';
    this.activeTopSideSubIndex = { mainIndex, subIndex };
    this.activeTopSideIndex = null;
    this.activePipeLineIndex = null;
    this.activePipeLineSubIndex = null;
    this.scrollToTop.emit();
  }

  onClickOpenPipelineDetail(data: any, title: string, index: number) {
    this.title = data.title;
    this.mainTitle = '';
    this.type = data.type;
    this.status = data.failed > 0 ? "FALSE" : "TRUE"
    this.verificationText = title;
    this.activePipeLineIndex = index;
    this.activePipeLineSubIndex = null;
    this.activeTopSideIndex = null;
    this.activeTopSideSubIndex = null;
    this.scrollToTop.emit();

  }

  onClickOpenPipelineSubDetail(data: any, mainIndex: number, subIndex: number) {
    this.title = data.title;
    this.mainTitle = data.mainTitle;
    this.type = data.type;
    this.status = data.status
    this.verificationText = this.pipeLineData?.pipeLine?.title || 'Pipeline Verification';
    this.activePipeLineSubIndex = { mainIndex, subIndex };
    this.activePipeLineIndex = null;
    this.activeTopSideIndex = null;
    this.activeTopSideSubIndex = null;
    this.scrollToTop.emit();
  }
  
  mappingTopSide() {
    const topSideList = this.dataTopSide?.data?.map((e: any) => {
      return this.mappingOverView(e);
    })

    const data = {
      "topside": {
        "title": "Topside Verification",
        "sumResult": {
          "failed": 0,
          "success": 0,
          "status": true
        },
        results: topSideList ?? []
      }
    }
    const sumSuccess = topSideList?.filter((e: any) => e.success).length;
    const sumFailed = topSideList?.filter((e: any) => e.failed).length;
    data.topside.sumResult.failed = sumFailed;
    data.topside.sumResult.success = sumSuccess;
    data.topside.sumResult.status = sumFailed > 0 ? false : true;

    this.topSideData = data;
    this.topSideDetails = topSideList;
  }

  mappingPipeLine() {
    const data = {
      pipeLine: {
        title: "Pipeline Verification",
        sumResult: {
          failed: 0,
          success: 0,
          status: true
        },
        results: this.mappingOverViewPipeLine()
      }
    }

    this.pipeLineData = data;
    this.pipeLineDetails = this.mappingOverViewPipeLine();

    const sumSuccess = this.mappingOverViewPipeLine()?.filter((e: any) => e.success).length;
    const sumFailed = this.mappingOverViewPipeLine()?.filter((e: any) => e.failed).length;
    data.pipeLine.sumResult.failed = sumFailed;
    data.pipeLine.sumResult.success = sumSuccess;
    data.pipeLine.sumResult.status = sumFailed > 0 ? false : true;
  }

  setTextDefault() {
    if (this.hasValue(this.dataTopSide)) {
      this.verificationText = `${this.topSideData?.topside?.title}`;
      this.title = 'Position 1 Production Manifold';
      this.mainTitle = '';
      this.type = 'default';
      this.activeTopSideIndex = 0;
      this.status = this.topSideData?.topside?.results[0]?.failed > 0 ? 'FALSE' : 'TRUE'
    } else if (this.hasValue(this.dataPipeLine)) {
      this.verificationText = `${this.pipeLineData?.pipeLine?.title}`
      this.title = 'Position 4';
      this.mainTitle = 'Position 4';
      this.type = 'default';
    } else {
      this.verificationText = '';
      this.title = '';
      this.mainTitle = '';
      this.type = 'empty';
    }

  }

  hasValue(data: any): boolean {
    if (data === null || data === undefined) return false;
    if (Array.isArray(data) && data.length === 0) return false;
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) return false;
    return true;
  }

  mappingTitle(position: number, subPosition: number) {
    const newPosition = `${position}-${subPosition}` as titleSummaryType;
    return titleSummary[newPosition] ?? '';
  }


  mappingOverView(data: any) {
    const overViewData = {
      title: this.mappingTitle(data.position, data.subPosition),
      type: "default",
      success: 0,
      failed: 0,
      overView: data.overview,
      pipingDetail: data.pipingDetail,
      hysysOutput: data.hysysOutput,
      thermowell:null,
      processInformation: null,
      details: [
        this.mappingOverViewVelocity(data),
        this.mappingOverViewErosion(data),
        this.mappingOverViewFivLof(data),
        this.mappingOverViewFitForSevice(data),
        this.mappingOverViewWakeFrequency(data)
      ].flat(),
      items: [
        this.mappingLineSizing(data),
        this.mappingFlowInducedVibration(data),
        this.mappingFitForSevice(data),
        this.mappingWakeFrequency(data)
      ].flat()
    };
    const trueCount = overViewData.items.filter(i => i.status === 'TRUE').length;
    const falseCount = overViewData.items.filter(i => i.status === 'FALSE').length;

    overViewData.success = trueCount;
    overViewData.failed = falseCount;

    return overViewData
  }

  mappingLineSizing(data: { pipingDetail: any; position: number; subPosition: number; lineSizing?: any; }) {
    if (data?.lineSizing) {
      const result = data?.lineSizing;
      const keysToCheck = [
        'resultMaxMomentum',
        'resultVmaxVelocity',
        'resultCmaxVelocity',
        'ErosionCalculationResult'
      ];

      let status: string = 'EMPTY';

      for (const key of keysToCheck) {
        const value = result?.[key];
        if (value === false) {
          status = 'FALSE';
          break;
        } else if (value === true && status !== 'TRUE') {
          status = 'TRUE';
        }
      }
      return {
        mainTitle: this.mappingTitle(data.position, data.subPosition),
        title: "Line Sizing",
        type: "line_sizing",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: {
          ...data.lineSizing,
          resultMaxMomentum: data.lineSizing.resultMaxMomentum === true ? 'TRUE' : data.lineSizing.resultMaxMomentum === false ? 'FALSE' : 'EMPTY',
          resultVmaxVelocity: data.lineSizing.resultVmaxVelocity === true ? 'TRUE' : data.lineSizing.resultVmaxVelocity === false ? 'FALSE' : 'EMPTY',
          resultCmaxVelocity: data.lineSizing.resultCmaxVelocity === true ? 'TRUE' : data.lineSizing.resultCmaxVelocity === false ? 'FALSE' : 'EMPTY',
          ErosionCalculationResult: data.lineSizing.ErosionCalculationResult === true ? 'TRUE' : data.lineSizing.ErosionCalculationResult === false ? 'FALSE' : 'EMPTY'
        },
        criteria: data.pipingDetail
      }
    } else {
      return []
    }
  }

  mappingFlowInducedVibration(data: { position: any; subPosition: any; fivLof?: any; }) {
    if (data?.fivLof) {
      const result = data.fivLof.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: this.mappingTitle(data.position, data.subPosition),
        title: "Flow-Induced Vibration",
        type: "flow_induced_vibration",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data?.fivLof?.lof
      }
    } else {
      return []
    }
  }

  mappingFitForSevice(data: { position: any; subPosition: any; fitForService?: any; }) {
    if (data.fitForService) {
      const result = data.fitForService.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: this.mappingTitle(data.position, data.subPosition),
        title: "Fit for Service",
        type: "fit_for_service",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data.fitForService
      }
    } else {
      return []
    }
  }

  mappingWakeFrequency(data: { position: any; subPosition: any; thermowell?: any; }) {
    if (data.thermowell) {
      const result = data.thermowell[this.findMaxFrequencyIndex(data.thermowell)].thermowellResult;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: this.mappingTitle(data.position, data.subPosition),
        title: "Wake Frequency",
        type: "wake_frequency",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        findMaxFrequencyDetail: data.thermowell[this.findMaxFrequencyIndex(data.thermowell)],
        details: data.thermowell
      }
    } else {
      return []
    }
  }

  mappingOverViewVelocity(data: { lineSizing?: any; }) {
    if (data?.lineSizing) {
      const result = data.lineSizing?.resultMaxMomentum;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Momentum (PV²)',
        value: data.lineSizing?.momentum,
        status: status,
        unit: 'kg/m.s²'
      }
    } else {
      return []
    }
  }

  mappingOverViewVelocityCMAX(data: { lineSizing?: any; }) {
    if (data?.lineSizing) {
      const result = data.lineSizing?.resultCmaxVelocity;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'API14E (erosional) - C max velocity',
        value: this.displayDecimal(data.lineSizing?.velocity, 2),
        status: status,
        unit: 'm/s'
      }
    } else {
      return []
    }
  }

  mappingOverViewVelocityVMAX(data: { lineSizing?: any; }) {
    if (data?.lineSizing) {
      const result = data.lineSizing?.resultVmaxVelocity;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'API14E (erosional) - V max velocity',
        value: this.displayDecimal(data.lineSizing?.velocity, 2),
        status: status,
        unit: 'm/s'
      }
    } else {
      return []
    }
  }

  mappingOverViewErosion(data: { lineSizing: any; }) {
    if (data?.lineSizing?.ErosionCalculationOutput) {
      return {
        verification: data.lineSizing.ErosionCalculationOutput.type === 'max_sand_rate' ? 'Sand Production' : 'Erosion',
        value: this.displayDecimal(data.lineSizing.ErosionCalculationOutput.value, 2) || 0,
        status: data.lineSizing.ErosionCalculationResult === true ? 'TRUE' : data.lineSizing.ErosionCalculationResult === false ? 'FALSE' : 'EMPTY',
        unit: data.lineSizing.ErosionCalculationOutput.type === 'max_sand_rate' ? 'kg/day' : 'mm/year'
      }
    } else {
      return [];
    }
  }

  mappingOverViewFivLof(data: { fivLof?: any; }) {
    if (data?.fivLof) {
      const result = data.fivLof?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Flow-Induced vibration (LOF)',
        value: data.fivLof.lof,
        status: status,
        unit: ''
      }
    } else {
      return []
    }
  }

  mappingOverViewFitForSevice(data: { fitForService?: any; }) {
    if (data?.fitForService) {
      const result = data.fitForService?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Maximum Allowable Operating Pressure (Fit for Service)',
        value: this.displayDecimal(data.fitForService?.maximumOperatingPressure, 1),
        status: status,
        unit: 'barg'
      }
    } else {
      return []
    }
  }

  mappingOverViewWakeFrequency(data: { thermowell?: any; }) {
    if (data?.thermowell) {
      const result = data.thermowell[this.findMaxFrequencyIndex(data.thermowell)].thermowellResult;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: `Frequency Criteria (${this.displayWakeFrequency(data.thermowell[this.findMaxFrequencyIndex(data.thermowell)].phaseType)})`,
        value: this.displayDecimal(data.thermowell[this.findMaxFrequencyIndex(data.thermowell)].compareFrequency, 1) || 0,
        status: status,
        unit: ''
      }
    } else {
      return []
    }
  }

  mappingOverViewPipeLine() {
    if (this.dataPipeLine) {
      const overViewData = {
        title: 'Position 4',
        type: "default",
        success: 0,
        failed: 0,
        isHasEmpty: false,
        details: [
          this.mappingOverViewErosinalVelocity(this.dataPipeLine),
          this.mappingOverViewTemperatureProfile(this.dataPipeLine),
          this.mappingOverViewPressureProfile(this.dataPipeLine),
          this.mappingOverViewSourServiceProfile(this.dataPipeLine)
        ].flat(),
        items: [
          this.mappingErosinalVelocity(this.dataPipeLine),
          this.mappingTemperatureProfile(this.dataPipeLine),
          this.mappingPressureProfile(this.dataPipeLine),
          this.mappingSourServiceProfile(this.dataPipeLine)
        ].flat()
      };

      const trueCount = overViewData.items.filter(i => i.status === 'TRUE').length;
      const falseCount = overViewData.items.filter(i => i.status === 'FALSE').length;
      const emptyCount = overViewData.items.filter(i => i.status === 'EMPTY').length;

      overViewData.success = trueCount;
      overViewData.failed = falseCount;
      overViewData.isHasEmpty = emptyCount >= 1 ? true : false;

      return [overViewData]
    } else {
      return [];
    }
  }

  mappingOverViewErosinalVelocity(data: { erosionalVelocity?: any; }) {
    if (data?.erosionalVelocity) {
      const result = data.erosionalVelocity.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Erosional Velocity Ratio',
        value: this.mappingDataForErosionalVelocity(data?.erosionalVelocity?.data),
        status: status,
        unit: ''
      }
    } else {
      return []
    }
  }

  mappingOverViewTemperatureProfile(data: { temperatureProfile?: any; }) {
    if (data?.temperatureProfile) {
      const result = data?.temperatureProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Temperature Profile',
        value: this.mappingDataForPipeLine(data?.temperatureProfile?.data),
        status: status,
        unit: '°C'
      }
    } else {
      return []
    }
  }

  mappingOverViewPressureProfile(data: { pressureProfile?: any; }) {
    if (data?.pressureProfile) {
      const result = data?.pressureProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Pressure Profile',
        value: this.mappingDataForPipeLine(data?.pressureProfile?.data),
        status: status,
        unit: 'barg'
      }
    } else {
      return []
    }
  }

  mappingOverViewSourServiceProfile(data: { sourServiceProfile?: any; }) {
    if (data?.sourServiceProfile) {
      const result = data?.sourServiceProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        verification: 'Sour Service Region and Design',
        value: data?.sourServiceProfile?.data?.yCoordinate,
        status: status,
        unit: ''
      }
    } else {
      return []
    }
  }

  mappingErosinalVelocity(data: { erosionalVelocity?: any; }) {
    if (data?.erosionalVelocity) {
      const result = data?.erosionalVelocity?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: "Position 4",
        title: "Erosional Velocity Ratio",
        type: "erosianol_velocity",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data?.erosionalVelocity?.data,
        result: this.mappingDataForErosionalVelocity(data?.erosionalVelocity?.data)
      }
    } else {
      return []
    }
  }

  mappingTemperatureProfile(data: { temperatureProfile?: any; }) {
    if (data?.temperatureProfile) {
      const result = data?.temperatureProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: "Position 4",
        title: "Temperature Profile",
        type: "temperature_profile",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data?.temperatureProfile?.data,
        result: this.mappingDataForPipeLine(data?.temperatureProfile?.data),
        resultCriteria: this.mappingDataForPipeLine(data?.temperatureProfile?.criteria),
        criteria: data?.temperatureProfile?.criteria
      }
    } else {
      return []
    }
  }

  mappingPressureProfile(data: { pressureProfile?: any; }) {
    if (data?.pressureProfile) {
      const result = data?.pressureProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: "Position 4",
        title: "Pressure Profile",
        type: "pressure",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data?.pressureProfile?.data,
        result: this.mappingDataForPipeLine(data?.pressureProfile?.data),
        resultCriteria: this.mappingDataForPipeLine(data?.pressureProfile?.data),
        criteria: data?.pressureProfile?.criteria,
      }
    } else {
      return []
    }
  }

  mappingSourServiceProfile(data: { sourServiceProfile?: any; }) {
    if (data?.sourServiceProfile) {
      const result = data?.sourServiceProfile?.result;
      const status = result === true ? 'TRUE' : result === false ? 'FALSE' : 'EMPTY';
      return {
        mainTitle: "Position 4",
        title: "Sour Service Region and Design",
        type: "sour_service",
        success: status === 'TRUE' ? 1 : 0,
        failed: status === 'FALSE' ? 1 : 0,
        status: status,
        details: data?.sourServiceProfile?.data,
        criteria: data?.sourServiceProfile?.criteria,
        input: data?.sourServiceProfile?.input
      }
    } else {
      return []
    }
  }

  findMaxFrequencyIndex(data: { compareFrequency: number }[]): number {
    return data.reduce((maxIndex, current, index, arr) => {
      return current.compareFrequency > arr[maxIndex].compareFrequency ? index : maxIndex;
    }, 0);
  }

  displayDecimal(value: number, decimal: number) {
    return this.userNameService.formatOneDecimalIfNeeded(value, decimal);
  }

  displayWakeFrequency(text: wakeFrequencyType): string {
    return mappingWakeFrequency[text] ?? ''
  }


  mappingDataForPipeLine(data: any) {
    const mapData = data?.flatMap((detail: any) =>
      detail.data.map((point: any) => ({
        x: point.xCoordinate,
        y: point.yCoordinate
      }))
    ) ?? [];
    const maximumValue = Math.max(...mapData.map((item: any) => item.y));
    return maximumValue;
  }

  mappingDataForErosionalVelocity(data: any[]) {
    const mapData = data.map((point) => ({
      erosionalVelocityRatio: point.erosionalVelocityRatio
    }))
    const maximumValue = Math.max(...mapData.map((item) => item.erosionalVelocityRatio));
    return maximumValue;
  }

}


