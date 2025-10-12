import {
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  TemplateRef,
} from '@angular/core';
import { GlobalTemplateComponent, TemplateTypeMap } from '../../shared/components/global-template/global-template.component';

@Injectable({
  providedIn: 'root',
})
export class GlobalTemplateService {
  private readonly _data: GlobalTemplateComponent;

  /**
   * Constructs an instance of GlobalTemplateService.
   * It initializes the GlobalTemplateComponent and stores its instance
   * for later use.
   */
  constructor() {
    const environmentInjector = inject(EnvironmentInjector);
    this._data = createComponent(GlobalTemplateComponent, {
      environmentInjector,
    }).instance;
  }

  /**
   * Retrieves a specific template by name from the GlobalTemplateComponent.
   * @param templateName - The name of the template to retrieve.
   * @returns The requested template from the GlobalTemplateComponent.
   */
  getTemplate<K extends keyof TemplateTypeMap>(
    templateName: K,
  ): TemplateRef<TemplateTypeMap[K]> {
    return this._data[templateName] as TemplateRef<TemplateTypeMap[K]>;
  }
}
