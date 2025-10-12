import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-erosional-velocity',
  imports: [CommonModule],
  templateUrl: './erosional-velocity.component.html',
  styleUrl: './erosional-velocity.component.scss'
})
export class ErosionalVelocityComponent {
  @Input() details: any;
  @Input() title: string = 'Position 4';
  erosionalVelocity:any;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details']) {
      this.mappingData();
    }
  }

  mappingData(){
    this.erosionalVelocity = this.details[0].items.find((e: any) => e.type === 'erosianol_velocity');
  }
  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      default:
        if (isIntegerLike(value)) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    }
  }
}
