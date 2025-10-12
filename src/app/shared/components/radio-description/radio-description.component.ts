import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@Component({
  selector: 'app-radio-description',
  standalone: true,
  imports: [CommonModule, FormsModule, NzRadioModule],
  templateUrl: './radio-description.component.html',
  styleUrl: './radio-description.component.scss'
})
export class RadioDescriptionComponent {
  @Input() options: { label: string; value: any; description: string }[] = [];
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  onChange(value: any): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
