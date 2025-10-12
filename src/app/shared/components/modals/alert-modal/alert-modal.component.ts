import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService, AlertData } from '../../../services/alert.service';

@Component({
  selector: 'app-alert-modal',
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent {
  constructor(private readonly alertService: AlertService) { }
  alert: AlertData | null = null;

  @Input() title = 'Success!';
  @Input() message = 'Your operation was successful.';
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();


  ngOnInit() {
    this.alertService.alert$.subscribe(data => {
      this.alert = data;
    });

  }

  hide() {
    this.alertService.close();
  }
}
