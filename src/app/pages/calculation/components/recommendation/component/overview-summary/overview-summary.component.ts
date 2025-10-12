import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import { PromptComponent } from "../../../../../../shared/components/prompt/prompt.component";
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { connectionType, mapMaterialType, mappingConnectionType, mappingStemType, mappingThermowellMaterial, mappingWakeFrequency, mapRegion, mapSpanType, materialType, spanType, stemType, thermowellMaterial, wakeFrequencyType } from '../../../../../../core/enums/calculation.enum';
import { ThermowellDetail } from '../../../../../../core/models/calculation/thermowell.model';

@Component({
  selector: 'app-overview-summary',
  imports: [CommonModule, TagComponent, PromptComponent],
  standalone: true,
  templateUrl: './overview-summary.component.html',
  styleUrl: './overview-summary.component.scss'
})
export class OverviewSummaryComponent {
  @Input() details: any;
  @Input() title: string = 'Position 1 production Manifold';
  @Input() verification: string = '';
  isLineSizing: boolean = false;
  isFitForService: boolean = false;
  isFivLof: boolean = false;
  isThermowell: boolean = false;
  isErosionalVelocity: boolean = false;
  isTemperatureProfile: boolean = false;
  isPressureProfile: boolean = false;
  isSourService: boolean = false;
  promptData: any;
  lineSizingCriteria: any;
  fivLofCriteria: any;
  fitForServiceCriteria: any;
  thermowell: any;
  erosionalVelocityCriteria: any;
  temperatureProfileCriteria: any;
  pressureProfileCriteria: any;
  sourServiceCriteria: any;
  columnData = [
    {
      key: 'verification ',
      label: 'Verification '
    },
    {
      key: 'status ',
      label: 'Status '
    },
    {
      key: 'value ',
      label: 'Value '
    },
    {
      key: 'unit ',
      label: 'Unit '
    }
  ]

  constructor(
    private readonly userNameService: UserNameService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['title']) {
      this.checkTemplate();
      this.checkDetail();
    }
  }
  checkTemplate() {
    const findPosition = this.details?.find((e: any) => e.title === this.title);
    if (!findPosition?.items) return;
    this.isFitForService = findPosition.items.some((d: any) => d.type === 'fit_for_service');
    this.isLineSizing = findPosition.items.some((d: any) => d.type === 'line_sizing');
    this.isFivLof = findPosition.items.some((d: any) => d.type === 'flow_induced_vibration');
    this.isErosionalVelocity = findPosition.items.some((d: any) => d.type === 'erosianol_velocity');
    this.isTemperatureProfile = findPosition.items.some((d: any) => d.type === 'temperature_profile');
    this.isPressureProfile = findPosition.items.some((d: any) => d.type === 'pressure');
    this.isSourService = findPosition.items.some((d: any) => d.type === 'sour_service');
    this.isThermowell = findPosition.items.some((d: any) => d.type === 'wake_frequency');
  }

  checkDetail() {
    const findPosition = this.details?.find((e: any) => e.title === this.title);
    if (!findPosition?.items) return;
    this.promptData = findPosition;
    this.lineSizingCriteria = findPosition.items.find((d: any) => d.type === 'line_sizing');
    this.fivLofCriteria = findPosition.items.find((d: any) => d.type === 'flow_induced_vibration');
    this.fitForServiceCriteria = findPosition.items.find((d: any) => d.type === 'fit_for_service');
    this.erosionalVelocityCriteria = findPosition.items.find((d: any) => d.type === 'erosianol_velocity');
    this.pressureProfileCriteria = findPosition.items.find((d: any) => d.type === 'pressure');
    this.temperatureProfileCriteria = findPosition.items.find((d: any) => d.type === 'temperature_profile');
    this.sourServiceCriteria = findPosition.items.find((d: any) => d.type === 'sour_service');
    this.thermowell = findPosition.items.find((d: any) => d.type === 'wake_frequency');
  }

  isValid(value: any): boolean {
    return value !== null && value !== undefined;
  }

  displayDecimal(value: number, decimal: number) {
    return this.userNameService.formatOneDecimalIfNeeded(value, decimal);
  }

  displayMaterialType(text: materialType): string {
    return mapMaterialType[text] ?? '';
  }

  displaySpanType(text: string): string {
    return mapSpanType[text] ?? '';
  }

  displayRegion(text: string): string {
    return mapRegion[text] ?? '';
  }

  displayWakeFrequency(text: wakeFrequencyType): string {
    return mappingWakeFrequency[text] ?? ''
  }

  displayStemType(text: stemType): string {
    return mappingStemType[text] ?? ''
  }

  displayConnectionType(text: connectionType): string {
    return mappingConnectionType[text] ?? ''
  }

  displayThermowellMaterial(text: thermowellMaterial): string {
    return mappingThermowellMaterial[text] ?? ''
  }

  getDisplayValue<K extends keyof ThermowellDetail>(
    field: K,
    details: ThermowellDetail[]
  ): { phaseType: ThermowellDetail['phaseType']; value: ThermowellDetail[K] } | null {
    const gas = details.find(d => d.phaseType === 'gas');
    if (gas && gas[field] !== null && gas[field] !== undefined) {
      return { phaseType: 'gas', value: gas[field] };
    }


    const fallback = details.find(
      d => (d.phaseType === 'oil' || d.phaseType === 'water') && d[field] !== null && d[field] !== undefined
    );
    if (fallback) {
      return { phaseType: fallback.phaseType, value: fallback[field] };
    }

    return null;
  }

  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem?.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem?.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      case 'Momentum (PV²)':
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value ?? 0);
      case 'Velocity API':
      case 'Max Sand Rate':
        if (isIntegerLike(value) || Math.abs(value) < 0.05) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value ?? 0);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value ?? 0);

      case 'Sand Production':
      case 'Flow-Induced vibration':
      case 'Fit for service':
      case 'Vapi':
      case 'Vmax':
      case 'Thickness':
      case 'Erosion Rate':
      case 'Maximum Allowable Operating Pressure (Fit for Service)':
        if (isIntegerLike(value) || Math.abs(value) < 0.05) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value ?? 0);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value ?? 0);

      case 'Erosional Velocity Ratio':
      case 'Temperature Profile':
      case 'Pressure Profile':
      case 'Sour Service Region and Design':
      case 'Piping Size':
      case 'Topside Design Pressure':
      case 'Erosion Velocity Constant':
      case 'Inner Diameter':
      case 'Volume Flow Rate':
        if (isIntegerLike(value)) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);

      default:
        if (isIntegerLike(value)) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value ?? 0);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value ?? 0);
    }
  }
}
