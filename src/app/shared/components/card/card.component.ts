import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NzCardModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() style?: { [style: string]: any } | null;
  @Input() title: string | TemplateRef<void> | undefined;
  @Input() extra: string | TemplateRef<void> | undefined;
  @Input() bgColor = '#F8F9FA';
  @Input() titleFontSize = '30px';
  @Input() addPadding = true;
  @Input() type: string | null = null;
  @Input() footerBorder: boolean = false;
  @Input() footerClass: string = '';
  @Input() class: string = '';
  @Input() footerText: string | null = null;
}
