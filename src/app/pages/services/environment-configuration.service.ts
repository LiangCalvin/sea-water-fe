/**
 * EnvironmentConfigurationService is responsible for managing the application's
 * environment configuration settings. It provides methods to retrieve and update
 * the environment configuration, as well as to obtain the base URL for service
 * endpoints.
 *
 * Dependencies:
 * - APP_CONFIG: Injection token for the application configuration.
 */

import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, EnvironmentConfiguration } from '../../core/interfaces/environment-configuration';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentConfigurationService {
  private _envConfig!: EnvironmentConfiguration;

  /**
   * Constructs an instance of EnvironmentConfigurationService.
   * @param envConfig - The initial environment configuration injected via
   * APP_CONFIG.
   */
  constructor(
    @Inject(APP_CONFIG) private readonly envConfig: EnvironmentConfiguration,
  ) {
    this._envConfig = this.envConfig;
  }

  /**
   * Retrieves the current environment configuration.
   * @returns {EnvironmentConfiguration} The current environment configuration.
   */
  public getEnvConfig(): EnvironmentConfiguration {
    return this._envConfig;
  }

  /**
   * Updates the environment configuration with the provided partial configuration.
   * @param config - A partial configuration object to merge with the current
   * environment configuration.
   */
  public setEnvConfig(config: Partial<EnvironmentConfiguration>): void {
    this._envConfig = { ...this._envConfig, ...config };
  }

  /**
   * Retrieves the base URL for service endpoints defined in the environment
   * configuration.
   * @returns {string} The base URL for service endpoints.
   */
  public getBaseUrl(): string {
    return `${this._envConfig.BASE_URL_SERVICE}`
  }

  /**
   * Retrieves the base URL for service endpoints defined in the environment
   * configuration.
   * @returns {string} The base URL for service endpoints.
   */

  public getBaseAPIGW(): string {
    return `${this._envConfig.APIGW_BASE_URL}`
  }

  /**
 * Retrieves the base URL for service endpoints defined in the environment
 * configuration.
 * @returns {string} The base URL for service endpoints.
 */

  public getBaseXBrain(): string {
    return `${this._envConfig.X_BRAIN_URL}`
  }

  /**
* Retrieves the base URL for service endpoints defined in the environment
* configuration.
* @returns {string[]} The base URL for service endpoints.
*/

  public getSequenceFlow(): string[] {
    return this._envConfig.SEQUENCE_FLOW!;
  }

}
