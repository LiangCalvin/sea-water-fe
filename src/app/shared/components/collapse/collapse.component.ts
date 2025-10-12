import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-collapse',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzInputModule,
    NzSelectModule
  ],
  templateUrl: './collapse.component.html',
  styleUrl: './collapse.component.scss'
})
export class CollapseComponent {
  @Input() label: string = '';
  @Input() isOpen:boolean = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}

