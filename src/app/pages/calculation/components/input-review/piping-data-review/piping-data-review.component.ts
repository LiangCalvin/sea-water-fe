import { Component, Input } from '@angular/core';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-piping-data-review',
  imports: [CommonModule, CollapseComponent, NzRowDirective, NzColDirective],
  templateUrl: './piping-data-review.component.html',
  styleUrl: './piping-data-review.component.scss'
})
export class PipingDataReviewComponent {
  expanded = true;
  @Input() pipingDataInput: any[] = [];

  // piping-data-review.component.ts
  materialOptions = [
    { id: 'carbon_steel', name: 'Carbon Steel' },
    { id: 'stainless_steel', name: 'Stainless Steel' },
  ];
  // piping-data-review.component.ts
  spanTypeOptions = [
    { id: 'stiff', name: 'Stiff' },
    { id: 'medium_stiff', name: 'Medium Stiff' },
    { id: 'medium', name: 'Medium' },
    { id: 'flexible', name: 'Flexible' },
    { id: 'custom', name: 'Custom' }
  ];
  getMaterialName(id: string): string {
    const option = this.materialOptions.find(m => m.id === id);
    return option ? option.name : id; // fallback to id if not found
  }

  getSpanTypeName(id: string): string {
    const option = this.spanTypeOptions.find(s => s.id === id);
    return option ? option.name : id; // fallback if not found
  }

  getPositionTypeLabel(item: any, index: number): string {
    if (item.positionType === 'custom') {
      return 'Custom';
    }

    if (item.positionType === 'same_as_1') {
      // Position 1 is always Production Manifold
      if (item.position === 1) {
        return 'Same as Production Manifold';
      }

      // Position 2 (sub 1 or sub 2) always references Export Manifold
      if (item.position === 2) {
        return 'Same as Export Manifold';
      }

      // Position 3+ also reference Export Manifold
      if (item.position > 2) {
        return 'Same as Export Manifold';
      }
    }

    return '';
  }
}
