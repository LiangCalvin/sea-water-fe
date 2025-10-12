import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { mapMaterialType, materialType } from '../../../../../../core/enums/calculation.enum';


@Component({
  selector: 'app-line-sizing',
  imports: [CommonModule, TagComponent],
  standalone:true,
  templateUrl: './line-sizing.component.html',
  styleUrl: './line-sizing.component.scss'
})
export class LineSizingComponent {
  @Input() details: any;
  @Input() title: string = 'Position 1 production Manifold';

  constructor(
    private userNameService: UserNameService
  ) { }

  displayDecimal(value: number, decimal:number) {
    return this.userNameService.formatOneDecimalIfNeeded(value,decimal);
  }

  displayMaterialType(text: materialType): string {
    return mapMaterialType[text] ?? '';
  }

  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      case 'Velocity API':
      case 'Max Sand Rate':
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
