import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { mappingWakeFrequency, wakeFrequencyType } from '../../../../../../core/enums/calculation.enum';

@Component({
  selector: 'app-wake-frequency',
  imports: [CommonModule],
  templateUrl: './wake-frequency.component.html',
  styleUrl: './wake-frequency.component.scss'
})
export class WakeFrequencyComponent {
  @Input() details: any;
  @Input() title: string = 'Position 1 production Manifold';

  constructor(
    private userNameService: UserNameService
  ) { }

  displayDecimal(value: number) {
    return this.userNameService.formatOneDecimalIfNeeded(value,1);
  }

  displayWakeFrequency(text: wakeFrequencyType): string {
    return mappingWakeFrequency[text] ?? ''
  }
  
  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      case 'Frequency Criteria':
        if (isIntegerLike(value) || Math.abs(value) < 0.05) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
      default:
        if (isIntegerLike(value)) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    }
  }
}
