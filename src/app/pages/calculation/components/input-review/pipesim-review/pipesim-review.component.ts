import { Component, Input } from '@angular/core';
import { CollapseComponent } from '../../../../../shared/components/collapse/collapse.component';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from "../../../../../shared/components/tooltip/tooltip.component";

@Component({
  selector: 'app-pipesim-review',
  imports: [CommonModule, CollapseComponent, TooltipComponent],
  templateUrl: './pipesim-review.component.html',
  styleUrl: './pipesim-review.component.scss',
})
export class PipesimReviewComponent {
  @Input() pipesimDataInput: any;
  expanded = true;

  // Add these methods to your component class
  getCoatingOrders(sections: any[]): number[] {
    if (!sections || sections.length === 0) return [];
    const maxCoatings = Math.max(
      ...sections.map((section) => section.coating?.length || 0),
    );

    return Array.from({ length: maxCoatings }, (_, i) => i + 1);
  }
  getCoatingByOrder(coatings: any[], order: number): any {
    return coatings.find((coating) => coating.order === order);
  }

  pipelineDesignRegionMap: Record<string, string> = {
    region_0: '0 (Non-sour service)',
    region_1: 'Region 1',
    region_2: 'Region 2',
    region_3: 'Region 3',
  };
}
