import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { EnvironmentConfigurationService } from './environment-configuration.service';
import { GlobalService } from './global.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SIDEBAR_COLLAPSE_KEY } from '../../core/enums/app-config.enum';

@Injectable({
    providedIn: 'root',
})
export class MfeLayoutService {
    private readonly router = inject(Router);
    private readonly envConfig = inject(EnvironmentConfigurationService);
    private readonly globalService = inject(GlobalService);
    protected disabledNavActiveClick: string[] = [];

    private readonly $window = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event: NavigationEnd) => event.url?.split('?')?.[0]),
        ),
        {
            initialValue: window.location.href?.split('?')?.[0],
        },
    );

    setDisabledNavActiveClick(nav: string): void {
        this.disabledNavActiveClick.push(nav);
    }

    getDisabledNavActiveClick(): string[] {
        return this.disabledNavActiveClick;
    }

    onUserChange(eventUser: Event) {
        const user = (eventUser as CustomEvent).detail;
        console.log('onUserChange', user);
    }

    handleAccessTokenChange(eventToken: Event): void {
        const token = (eventToken as CustomEvent).detail;
        const isTokenPresent = token !== '';
        const isLoginRoute = this.$window().includes('login');

        this.globalService.idToken().next(token);
        if (this.globalService.initRefreshToken$.getValue()) {
            this.globalService.onCompleteRequestNewRefreshToken();
            console.log(
                `refresh new token completed!!`,
                this.globalService.initRefreshToken$.getValue(),
            );
        }

        if (isLoginRoute && isTokenPresent) {
            this.router.navigate(['/']);
        } else if (!isTokenPresent) {
            this.handleEmptyToken();
        }
    }

    /**
     * Handles navigation to a specified URL, checking for token expiration and disabled navigation.
     * @param {string} url - The target URL to navigate to.
     */
    handleNavigation(eventNav: Event): void {
        const url = (eventNav as CustomEvent).detail;
        // Check for required credentials before navigating
        if (!this.globalService.hasServiceCredential) {
            this.router.navigate(['/credentials-not-found']);
            return;
        }

        const currentPath = this.$window();
        const [targetPath] = url.split('?');
        // Prevent navigation if the current or target path is in the disabled list
        const isDisabledNavigation = this.disabledNavActiveClick.some(
            (nav) =>
                (currentPath && currentPath.includes(nav)) || targetPath.includes(nav),
        );

        if (isDisabledNavigation) {
            return;
        }

        try {
            const fullUrl = new URL(url, location.origin);
            this.router.navigate([fullUrl.pathname], {
                queryParams: this.getParams(fullUrl),
            });
        } catch (e) {
            console.error('Invalid navigation URL:', url, e);
        }
    }

    /**
     * Clears specific keys from local storage related to the application state.
     */
    private clearStorage(): void {
        Object.keys(localStorage)
            .filter((key) => key.startsWith(SIDEBAR_COLLAPSE_KEY))
            .forEach((key) => localStorage.removeItem(key));
    }

    /**
     * Extracts query parameters from a given URL.
     * @param {URL} url - The URL from which to extract parameters.
     * @returns {Record<string, string>} An object containing the query parameters.
     */
    private getParams(url: URL): Record<string, string> {
        const urlParams = new URLSearchParams(url.search);
        const params = Object.fromEntries(urlParams.entries());
        return params;
    }

    /**
     * Handles the case where the ID token is empty, navigating to the login page if necessary.
     * @param {boolean} isExternalRoute - Indicates if the current route is external.
     * @param {boolean} isLoginRoute - Indicates if the current route is the login page.
     */
    private handleEmptyToken(): void {
        this.envConfig.setEnvConfig({
            APIGW_KEY: undefined,
            APIGW_SERVICE_NAME: undefined,
        });
        console.log('Token is empty, navigating to login page');
        this.clearStorage();
        this.router.navigate(['/login']);
    }
}
