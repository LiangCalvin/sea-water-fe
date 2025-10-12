/**
 * GlobalService is responsible for managing authentication tokens and user permissions
 * within the application. It handles the retrieval and storage of the ID token,
 * manages the refresh token process, and provides methods to check user permissions
 * based on roles defined in the ID token.
 *
 * The service uses BehaviorSubjects to maintain the state of sign-in, sign-out,
 * and token expiration, allowing components to reactively respond to changes in
 * authentication state.
 *
 * Dependencies:
 * - HttpClient: For making HTTP requests to retrieve credential data.
 * - EnvironmentConfigurationService: For accessing environment-specific configurations.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, filter, map, Observable, of, take } from 'rxjs';
import { EnvironmentConfigurationService } from './environment-configuration.service';
import { RoleEnum } from '../core/enums/role.enum';
import { CredentialData } from '../core/interfaces/credential';
import { EnvironmentConfiguration } from '../core/interfaces/environment-configuration';
import { Environment } from '../core/enums/environments.enum';



@Injectable({
    providedIn: 'root',
})

export class GlobalService {
    private readonly envConfigService = inject(EnvironmentConfigurationService);
    private readonly http = inject(HttpClient);
    private readonly BASE_URL = this.envConfigService.getBaseUrl();
    private readonly _idToken: BehaviorSubject<string> =
        new BehaviorSubject<string>('');
    private _idTokenProperty: Record<string, unknown> | undefined;

    private readonly _signIn = new BehaviorSubject(false);
    private readonly _signOut = new BehaviorSubject(false);
    private readonly _initRefreshToken = new BehaviorSubject(false);

    public readonly signIn$ = this._signIn;
    public readonly signOut$ = this._signOut;
    public readonly initRefreshToken$ = this._initRefreshToken;
    public setFakeTokenForLocalhost() {
        const fakeToken = this.createFakeJwt();
        this._idToken.next(fakeToken);
        this._idTokenProperty = { name: 'Local Dev', roles: ['USER'] };
    }

    constructor() {
        if (this.isLocalhost()) {
            // create a fake token with long expiry
            const fakeToken = this.createFakeJwt();
            this._idToken.next(fakeToken);
            this._idTokenProperty = jwtDecode(fakeToken) as Record<string, unknown>;
        }
    }

    private createFakeJwt(): string {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            name: 'Local Dev User',
            roles: [RoleEnum.FULL_ACCESS],
            exp: Math.floor(Date.now() / 1000) + 3600 * 24, // 24h validity
        };
        const base64Url = (obj: object) =>
            btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        return `${base64Url(header)}.${base64Url(payload)}.fake-signature`;
    }
    /**
     * Triggers a request for a new refresh token and sets the refresh token state.
     * This method simulates a refresh token request by updating the BehaviorSubject
     * for a short duration.
     */
    onRequestNewRefreshToken() {
        this._initRefreshToken.next(true);
    }

    /**
     * Signals the completion of a request for a new refresh token.
     *
     * This method emits `false` to the `_initRefreshToken` subject,
     * indicating that the refresh token request process has finished.
     */
    onCompleteRequestNewRefreshToken() {
        this._initRefreshToken.next(false);
    }

    /**
     * Triggers the sign-in state to indicate a Microsoft login.
     * The state is reset after a short duration.
     */
    // onMicrosoftLogin(): void {
    //   this._signIn.next(true);
    //   setTimeout(() => this._signIn.next(false), 1000);
    // }

    //LOCAL
    onMicrosoftLogin(): void {
        if (this.isLocalhost()) {
            console.warn('Skipping Microsoft login for localhost');
            return;
        }
        this._signIn.next(true);
        setTimeout(() => this._signIn.next(false), 1000);
    }
    /**
     * Triggers the sign-out state to indicate a Microsoft sign-out.
     * The state is reset after a short duration.
     */
    onMicrosoftSignOut(): void {
        this._signOut.next(true);
        setTimeout(() => this._signOut.next(false), 1000);
    }

    /**
     * Retrieves the current authentication token as an Observable.
     *
     * - If the token is not available, returns an Observable emitting an empty string.
     * - If the token is expired, triggers a refresh process and emits the new token once available.
     * - If the token is valid, returns the current token as an Observable.
     * - Handles errors gracefully by logging and returning an Observable emitting an empty string.
     *
     * @returns {Observable<string>} An Observable that emits the authentication token string.
     */
    getToken(): Observable<string> {
        if (this.isLocalhost()) {
            return of(this._idToken.getValue());
        }
        try {
            if (!this._idToken?.getValue()) {
                this._idTokenProperty = {};
                return of('');
            }

            if (this.isTokenExpired()) {
                console.log('token expired : ', this._idToken.getValue());

                this.onRequestNewRefreshToken();
                return this._initRefreshToken.pipe(
                    filter((init) => !init),
                    take(1),
                    map(() => {
                        console.log(`new token requested`, this._idToken.getValue());
                        const decodedToken = jwtDecode(this._idToken.getValue());
                        this._idTokenProperty = decodedToken as Record<string, unknown>;

                        return this._idToken.getValue();
                    }),
                );
            }
            const decodedToken = jwtDecode(this._idToken.getValue());
            this._idTokenProperty = decodedToken as Record<string, unknown>;

            return this._idToken;
        } catch (error) {
            console.error('Error retrieving token:', error);
            this._idTokenProperty = {};
            return of('');
        }
    }

    /**
     * Determines whether the current ID token is expired.
     *
     * This method checks if the stored ID token exists and, if so, decodes it to extract the expiration time (`exp` claim).
     * If the token is missing, invalid, or expired (i.e., the expiration time is less than the current time), the method returns `true`.
     *
     * @returns {boolean} `true` if the token is missing, invalid, or expired; otherwise, `false`.
     */
    isTokenExpired(): boolean {
        if (!this._idToken?.getValue()) {
            return true; // If no token is present, consider it expired
        }
        const decodedToken = jwtDecode(this._idToken.getValue());
        if (!decodedToken) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        const expirationDate = decodedToken?.exp ?? 0;
        return expirationDate < currentTime;
    }

    /**
     * Checks if the service has valid credentials based on the environment configuration.
     * @returns {boolean} True if both APIGW_KEY and APIGW_SERVICE_NAME are present, false otherwise.
     */
    get hasServiceCredential() {
        return !!(
            this.envConfigService.getEnvConfig().APIGW_KEY &&
            this.envConfigService.getEnvConfig().APIGW_SERVICE_NAME
        );
    }

    /**
     * Sets the credential data in the environment configuration service.
     * @param {CredentialData} data - The credential data to set.
     */
    setCredentialData(data: CredentialData) {
        this.envConfigService.setEnvConfig({
            APIGW_KEY: data.APIGW_KEY,
            APIGW_SERVICE_NAME: data.APIGW_SERVICE_NAME,
        });
    }

    public isLocalhost(): boolean {
        return window.location.origin.includes('localhost');
    }

    /**
     * Retrieves credential data from the system configuration endpoint.
     *
     * Sends an HTTP GET request to fetch the API gateway key and service name,
     * transforms the response into a `CredentialData` object, stores it using
     * `setCredentialData`, and returns an observable containing the credential data.
     *
     * @returns An `Observable` that emits an object with a `data` property containing the `CredentialData`.
     */

    // getCredentialData(): Observable<{ data: CredentialData }> {
    //   let params = new HttpParams();
    //   if (this.isLocalhost()) {
    //     params = params.append('origin', 'https://well-fast-dev.apps.pttep.com');
    //   }

    //   return this.http
    //     .get<{
    //       data: CredentialData;
    //     }>(
    //       `${this.envConfigService.getBaseAPIGW()}/ep-common/configs/v1/credentials/system`,
    //       { params }
    //     )
    //     .pipe(
    //       map((response) => {
    //         const data: CredentialData = {
    //           APIGW_KEY: response.data.APIGW_KEY,
    //           APIGW_SERVICE_NAME: response.data.APIGW_SERVICE_NAME,
    //         };
    //         this.setCredentialData(data);
    //         return { data };
    //       })
    //     );
    // }

    // FOR LOCAL HOST
    getCredentialData(): Observable<{ data: CredentialData }> {
        if (this.isLocalhost()) {
            const data: CredentialData = {
                APIGW_KEY: 'FAKE_KEY',
                APIGW_SERVICE_NAME: 'LOCAL_SERVICE',
            };
            this.setCredentialData(data);
            return of({ data });
        }

        return this.http
            .get<{ data: CredentialData }>(
                `${this.envConfigService.getBaseAPIGW()}/ep-common/configs/v1/credentials/system`
            )
            .pipe(
                map((response) => {
                    const data: CredentialData = {
                        APIGW_KEY: response.data.APIGW_KEY,
                        APIGW_SERVICE_NAME: response.data.APIGW_SERVICE_NAME,
                    };
                    this.setCredentialData(data);
                    return { data };
                })
            );
    }
    /**
     * Returns the BehaviorSubject for the ID token.
     * @returns {BehaviorSubject<string>} The BehaviorSubject containing the ID token.
     */
    idToken(): BehaviorSubject<string> {
        return this._idToken;
    }

    /**
     * Retrieves the decoded ID token properties.
     * @returns {Record<string, any> | undefined} The decoded token properties or undefined if not available.
     */
    getIdTokenProperty(): Record<string, any> | undefined {
        return this._idTokenProperty;
    }

    /**
     * Checks if the current ID token is expired.
     * @returns {boolean} True if the token is expired, false otherwise.
     */
    // isTokenExpired(): boolean {
    //   return this._isTokenExpired.value;
    // }
    /**
      * Retrieves fullname of user from the server.
      */
    getUserFullName(): string | undefined {
        const name = this._idTokenProperty?.['name'];
        return typeof name === 'string' ? name : undefined;
    }
    /**
     * Checks if the user has the specified permissions based on their roles.
     * @param {RoleEnum[] | RoleEnum} permissions - The permissions to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the user has the required permissions, false otherwise.
     */
    hasPermission(permissions: RoleEnum[] | RoleEnum): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 30000);

            this.getToken()
                .pipe(
                    filter((_token) => !this.isTokenExpired()),
                    take(1),
                )
                .subscribe((_token) => {
                    clearTimeout(timeout);
                    const tokenProperty = this.getIdTokenProperty();
                    const userRoles = Array.isArray(tokenProperty?.['roles'])
                        ? (tokenProperty['roles'] as RoleEnum[])
                        : [];
                    const roles = [...userRoles, RoleEnum.BYPASS];
                    resolve(
                        Array.isArray(permissions)
                            ? permissions.some((r) => roles.includes(r))
                            : roles.includes(permissions),
                    );
                });
        });
    }

    hasPermissionSync(permissions: RoleEnum[] | RoleEnum): boolean {
        const tokenProperty = this.getIdTokenProperty();
        const userRoles = Array.isArray(tokenProperty?.['roles'])
            ? (tokenProperty['roles'] as RoleEnum[])
            : [];
        const roles = [...userRoles, RoleEnum.BYPASS];
        const hasPermission = Array.isArray(permissions)
            ? permissions.some((r) => roles.includes(r))
            : roles.includes(permissions);
        return hasPermission;
    }
}

/**
 * Retrieves the application configuration from a JSON file.
 * This function makes a synchronous HTTP request to fetch the configuration
 * settings required for the application. It returns an object containing
 * various configuration properties, including URLs, application title,
 * and layout settings. If the request fails, it logs the error and returns
 * a default configuration object.
 *
 * @returns {EnvironmentConfiguration} The application configuration object.
 */
export function getApplicationConfig(): EnvironmentConfiguration {
    const request = new XMLHttpRequest();
    try {
        request.open('GET', '/assets/config/config.json', false);
        request.send(null);
        if (request.status === 200) {
            return JSON.parse(request.responseText);
        }
    } catch (error) {
        console.error(error);
    }
    return {
        APP_FRONTEND_URL: '',
        APP_TITLE: '',
        APP_VERSION: '',
        BASE_URL_SERVICE: '',
        APIGW_BASE_URL: '',
        BASE_URL: '',
        DEBUG_MODE: false,
        LAYOUT_STYLE: {
            header: {
                bgColor: '',
            },
            footer: {
                bgColor: '',
                textColor: '',
                isVisible: true,
            },
        },
        MICROSOFT_TENANT: '',
        MSAL_CLIENT_ID: '',
        NODE_ENV: Environment.unknown,
        EP_LAYOUT_URL: '',
    };

}
