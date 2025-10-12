import { Component, Input } from '@angular/core';
import { CollapseComponent } from "../../../../../shared/components/collapse/collapse.component";
import { CommonModule } from '@angular/common';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-process-information-review',
  imports: [CommonModule, CollapseComponent, NzRowDirective, NzColDirective],
  templateUrl: './process-information-review.component.html',
  styleUrl: './process-information-review.component.scss'
})
export class ProcessInformationReviewComponent {
  expanded = true;
  @Input() processDataInput: any[] = [];


  getPositionTitle(item: any): string {
    if (item.positionType === 'same_as_1') {
      return `Simulation Input Position ${item.position}.${item.subPosition} ${this.getPositionTypeLabel(item)}`;
    }
    return `Simulation Input Position ${item.position} Production and Export`;
  }

  getPositionTypeLabel(item: any): string {
    switch (item.positionType) {
      case 'same_as_1':
        return item.subPosition === 1 ? 'Receiving Facility 1' : 'Production Facility 2';
      default:
        return 'Production and Export';
    }
  }

  getSameAsLabel(item: any): string {
    return item.positionType === 'same_as_1' ? 'Same as position 1' : '';
  }
}
