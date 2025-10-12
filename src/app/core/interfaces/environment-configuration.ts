import { InjectionToken } from '@angular/core';
import { Site } from '../enums/datadog-site.enum';
import { Environment } from '../enums/environments.enum';
import { LayoutStyle, NavItemExtend } from '../models/mfe-models.model';

export const APP_CONFIG = new InjectionToken<EnvironmentConfiguration>(
  'env_config',
);

export const LOCAL_STORAGE_PREFIX = {
  STORE: '[STORE]',
  APP: '[APP]',
};

export interface EnvironmentConfiguration {
  APIGW_KEY?: string;
  APIGW_SERVICE_NAME?: string;
  APP_FRONTEND_URL: string;
  APP_TITLE: string;
  APP_VERSION: string;
  BASE_URL_SERVICE: string;
  APIGW_BASE_URL: string;
  BASE_URL: string;
  DATADOG_APPLICATION_ID?: string;
  DATADOG_CLIENT_TOKEN?: string;
  DATADOG_SERVICE_NAME?: string;
  DATADOG_SITE_URL?: Site;
  DEBUG_MODE: boolean;
  LAYOUT_STYLE: LayoutStyle;
  MICROSOFT_TENANT: string;
  MSAL_CLIENT_ID: string;
  NODE_ENV: Environment;
  EP_LAYOUT_URL: string;
  MOCK_LOGIN?: boolean;
  X_BRAIN_URL?:string;
  MENU_ITEMS?: NavItemExtend[];
  SEQUENCE_FLOW?: string[];
}
