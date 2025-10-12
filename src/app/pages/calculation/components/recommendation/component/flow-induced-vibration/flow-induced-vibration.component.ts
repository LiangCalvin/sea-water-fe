import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { flowInduceReccommendation } from '../../../../../../core/enums/calculation.enum';


@Component({
  selector: 'app-flow-induced-vibration',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './flow-induced-vibration.component.html',
  styleUrl: './flow-induced-vibration.component.scss'
})
export class FlowInducedVibrationComponent {
  @Input() details: any;
  @Input() title: string = 'Position 1 production Manifold';

  columnData = [
    {
      key: 'lof ',
      label: 'LOF '
    },
    {
      key: 'actions ',
      label: 'Actions '
    }
  ]

  recommendData = [
    {
      lof:flowInduceReccommendation.LOF_1,
      actions:flowInduceReccommendation.ACTION_1
    },
    {
      lof:flowInduceReccommendation.LOF_2,
      actions:flowInduceReccommendation.ACTION_2
    },
    {
      lof:flowInduceReccommendation.LOF_3,
      actions:flowInduceReccommendation.ACTION_3
    },
    {
      lof:flowInduceReccommendation.LOF_4,
      actions:flowInduceReccommendation.ACTION_4
    }
  ]

  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      case 'LOF':
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
