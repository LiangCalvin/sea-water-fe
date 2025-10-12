import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertModalComponent } from '../modals/alert-modal/alert-modal.component';
import { GlobalService } from '../../../services/global.service';
import { GlobalTemplateService } from '../../../services/global-template.service';

@Component({
  selector: 'app-app-template',
  imports: [RouterOutlet, CommonModule, AlertModalComponent],
  templateUrl: './app-template.component.html',
  styleUrl: './app-template.component.scss',
})
export class AppTemplateComponent {
  private router = inject(Router);
  protected globalService = inject(GlobalService);
  private templateService = inject(GlobalTemplateService);

  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');
  private $window = toSignal(
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url?.split('?')?.[0]),
    ),
    {
      initialValue: window.location.href?.split('?')?.[0],
    },
  );

  /**
   * Determines if the component can render based on the current window URL
   * and the service credentials.
   * @returns {boolean} True if the component can render, false otherwise.
   */
  get canRender() {
    return (
      this.$window().includes('login') ||
      this.$window().includes('credentials-not-found') ||
      this.globalService.hasServiceCredential
    );
  }
}
