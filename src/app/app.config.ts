import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
  inject,
  EnvironmentInjector,
  createComponent,
  TemplateRef,
  provideEnvironmentInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { APP_CONFIG } from './core/interfaces/environment-configuration';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApigeeInterceptor } from './core/interceptors/apigee.interceptor';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_ICONS, NzIconService } from 'ng-zorro-antd/icon';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { GlobalTemplateComponent } from './shared/components/global-template/global-template.component';
import { GlobalService } from './services/global.service';
import { environment } from '../../public/environments/environment';
import { useNzModules } from './nz-modules';
import { customIcons, useIcons } from './icon';

registerLocaleData(en);

const nzConfigFactory = (): NzConfig => {
  const environmentInjector = inject(EnvironmentInjector);
  const { loading, dataNotFound } = createComponent(GlobalTemplateComponent, {
    environmentInjector,
  }).instance;
  return {
    tabs: { nzAnimated: { inkBar: true, tabPane: false } },
    spin: { nzIndicator: loading },
    table: { nzLoadingIndicator: loading },
    select: { nzSuffixIcon: 'custom:down' },
    empty: {
      nzDefaultEmptyContent: dataNotFound as unknown as TemplateRef<string>,
    },
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    // { provide: HTTP_INTERCEPTORS, useClass: ApigeeInterceptor, multi: true },
    { provide: APP_CONFIG, useValue: environment },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(en_US),
    provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(FormsModule, ...useNzModules),
    provideEnvironmentInitializer(() => {
      const nzConfigService = inject(NzIconService);
      customIcons.forEach((i) =>
        nzConfigService.addIconLiteral(i.type, i.icon),
      );
    }),
    { provide: NZ_ICONS, useValue: useIcons },
    { provide: NZ_CONFIG, useFactory: nzConfigFactory },
  ],
};
provideEnvironmentInitializer(() => {
  const globalService = inject(GlobalService);
  if (window.location.origin.includes('localhost')) {
    globalService.setFakeTokenForLocalhost();
  }
});