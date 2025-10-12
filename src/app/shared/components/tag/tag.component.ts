import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule, NzTagModule],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {
  @Input() text: string = '';
  @Input() backgroundColor: string = '#E0F2FE';
  @Input() textColor: string = '#193C55';
  @Input() border:boolean = false;
  @Input() borderColor: string = ''
  @Input() icon?: string; 
  @Input() circle:boolean = false;


  get tagStyle(): { [key: string]: string } {
    return {
      color: this.textColor,
      border: this.border ? '1px solid ' + this.borderColor : 'none',
      ...this.circle ? this.circleStyle() : ''
    };
  }

  circleStyle(): { [key: string]: string } {
    return {
      width: '14px',
      height: '14px',
      'line-height': '32px',
      'text-align': 'center',
      'border-radius': '50%',
      padding: '0',
      display: 'inline-block'
    }
  }
}
