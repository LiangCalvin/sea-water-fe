import { EnvironmentConfiguration } from '../../src/app/core/interfaces/environment-configuration';
import { getApplicationConfig } from '../../src/app/services/global.service';

export const environment: EnvironmentConfiguration = {
  ...getApplicationConfig(),
  APP_VERSION: '$VERSION',
  MOCK_LOGIN: true
};
