import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { ButtonComponent } from "../button/button.component";
import { EnvironmentConfigurationService } from '../../../services/environment-configuration.service';
import { AlertMessageConstants } from '../../../core/enums/calculation.enum';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [CommonModule, TooltipComponent, ButtonComponent],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent {
  @ViewChild('prompt') promptRef!: ElementRef;
  activeTab: 'operational' | 'design' = 'operational';
  tooltipText = 'This is the first version of AI Recommendation. More features are coming soon.'
  private envConfigService = inject(EnvironmentConfigurationService);
  private readonly BASE_XBRAIN_URL = this.envConfigService.getBaseXBrain();

  constructor(
    private alertService:AlertService
  ){

  }

  copyPrompt() {  
    const text = this.promptRef.nativeElement.innerText || '';
    navigator.clipboard.writeText(text)
    .then(() => {
      const modalTitle = AlertMessageConstants.COPY_TEXT_SUCCESS_TITLE;
      const modalText = AlertMessageConstants.COPY_TEXT_SUCCESS_TEXT;
      this.alertService.success(modalTitle, modalText, true, 1000);
    })
    .catch(err =>
      console.error('Copy failed:', err)
    );
  }
  

  openNewTab(){
    window.open(this.BASE_XBRAIN_URL, '_blank');
  }
}
