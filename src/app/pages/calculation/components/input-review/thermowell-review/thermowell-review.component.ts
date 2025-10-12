import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-thermowell-review',
  imports: [CommonModule, CollapseComponent, TooltipComponent, NzButtonModule],
  templateUrl: './thermowell-review.component.html',
  styleUrl: './thermowell-review.component.scss',
  standalone: true,
})
export class ThermowellReviewComponent {
  expanded = true;
  @Input() thermowellDataInput?: any;
  @Input() pipingDataInput: any[] = [];

  get youngModulusFormattedHtml(): string {
    const value = this.thermowellDataInput?.youngModulus;
    if (value == null) return '';
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10<sup>${exponent}</sup>`;
  }

  stemTypeMap: Record<string, string> = {
    straight: 'Straight',
    tapered: 'Tapered',
    stepped: 'Stepped',
  };

  connectionTypeMap: Record<string, string> = {
    threaded: 'Threaded',
    flange: 'Flange',
    welded: 'Welded',
    van_stone: 'Van Stone',
  };

  get firstPiping() {
    return this.pipingDataInput?.[0];
  }

  get thermo() {
    return this.thermowellDataInput;
  }

  materialTypeMap: Record<string, string> = {
    '316l_ss': '316L SS',
    'super_duplex': 'Super Duplex',
  };
}
