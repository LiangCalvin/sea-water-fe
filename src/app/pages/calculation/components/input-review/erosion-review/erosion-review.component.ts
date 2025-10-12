import { Component, Input } from '@angular/core';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-erosion-review',
  imports: [CommonModule, CollapseComponent, NzRowDirective, NzColDirective],
  templateUrl: './erosion-review.component.html',
  styleUrl: './erosion-review.component.scss',
})
export class ErosionReviewComponent {
  expanded = true;
  @Input() erosionDataInput: any = {};
}
