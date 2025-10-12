import {
  AfterViewInit,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  ViewContainerRef,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  HeaderMenuIconItem,
  LayoutMode,
  PTTEP_LAYOUT_TAG,
  Theme,
} from './core/enums/mfe-configs.enum';

import { ITitle, NavItem, NavItemExtend } from './core/models/mfe-models.model';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  filter,
  map,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { CredentialData } from './core/interfaces/credential';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EnvironmentConfigurationService } from './pages/services/environment-configuration.service';
import { GlobalTemplateService } from './pages/services/global-template.service';
import { MfeLayoutService } from './pages/services/mfe-layout.service';
import { GlobalService } from './pages/services/global.service';
import { UnsavedChangesService } from './pages/services/unsaved-changes/unsaved-changes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly envConfig = inject(EnvironmentConfigurationService);
  private templateService = inject(GlobalTemplateService);
  protected readonly mfeLayoutService = inject(MfeLayoutService);
  protected globalService = inject(GlobalService);
  private readonly router = inject(Router);

  protected destroy$ = new ReplaySubject(1);
  protected theme = Theme.BLUE;
  protected loaded = false;
  protected menuItems: NavItem[] = [];
  readonly APP_NAV_TITLE: ITitle = {
    title: this.envConfig.getEnvConfig().APP_TITLE,
    iconPath: '../../../assets/images/logo.svg',
  };
  readonly HEADER_MENU_ICON_ITEMS: HeaderMenuIconItem[] = [
    HeaderMenuIconItem.HOME,
    HeaderMenuIconItem.NOTIFICATION,
    HeaderMenuIconItem.SEARCH,
    HeaderMenuIconItem.USER_MANUALS,
    HeaderMenuIconItem.XBRAIN,
  ];

  private readonly $window = toSignal(
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url?.split('?')?.[0]),
    ),
    {
      initialValue: window.location.href?.split('?')?.[0],
    },
  );
  protected $mode: Signal<LayoutMode> = computed(() =>
    this.$window().includes('external')
      ? LayoutMode.HIDDEN
      : LayoutMode.DEFAULT,
  );
  readonly LOADING_TEMPLATE = this.templateService.getTemplate('loading');

  constructor(
    private viewContainerRef: ViewContainerRef,
    private unsavedChangesService: UnsavedChangesService
  ) {
    this.setDynamicMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnInit() {
    // Usage
    // this.loadWebComponent(this.envConfig.getEnvConfig().EP_LAYOUT_URL)
    //   .then(() => console.log(`${PTTEP_LAYOUT_TAG} is ready!`))
    //   .catch(console.error);

    this.unsavedChangesService.setViewContainerRef(this.viewContainerRef);

  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   *
   * - Fetches credential data by calling `getCredentialData()`.
   * - Subscribes to Angular Router navigation events, specifically `NavigationEnd`.
   * - On each navigation end, regenerates the menu items by calling `generateMenuItems()`.
   * - The subscription is automatically unsubscribed when `destroy$` emits, preventing memory leaks.
   */

  ngAfterViewInit(): void {
    this.getCredentialData();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.generateMenuItems();
      });
  }

  /**
   * Dynamically loads a web component script from the specified URL with retry logic.
   *
   * @param url - The URL of the script to load.
   * @param retries - The number of retry attempts if the script fails to load (default is 1).
   * @returns A Promise that resolves when the script is successfully loaded, or rejects after all retries fail.
   *
   * @remarks
   * If the script fails to load after all retry attempts, the method calls `insertLayoutTemplateComponent(MainComponent)`
   * and rejects the promise with an error.
   *
   * @example
   * ```typescript
   * loadWebComponent('https://example.com/component.js', 3)
   *   .then(() => console.log('Component loaded!'))
   *   .catch(err => console.error('Failed to load component:', err));
   * ```
   */
  loadWebComponent(url: string, retries = 1) {
    return new Promise<void>((resolve, reject) => {
      if (retries === 0) {
        reject(new Error('Failed to load script after multiple attempts.'));
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        this.loaded = true;
        return resolve();
      };
      script.onerror = () => {
        console.log(`Retrying script load: ${retries - 1} attempts left.`);

        setTimeout(
          () => this.loadWebComponent(url, retries - 1).then(resolve, reject),
          2000,
        );
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Retrieves credential data for the current user session.
   *
   * This method performs the following steps:
   * 1. Subscribes to the global service's ID token observable.
   * 2. Filters out null, empty, or already credentialed tokens.
   * 3. Requests credential data from the global service.
   * 4. Sets relevant properties in the micro-frontend layout service using the retrieved credentials.
   * 5. Navigates to the root route if credentials are not found or an error occurs.
   *
   * @private
   * @returns {void}
   */
  private getCredentialData(): void {
    this.globalService
      .idToken()
      .pipe(
        filter(
          (token: string) =>
            token !== null &&
            token !== '' &&
            !this.globalService.hasServiceCredential,
        ),
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.globalService.getCredentialData().pipe(
            map((response: { data: CredentialData }) => response.data),
            tap((credentail: CredentialData) => {
              if (!credentail.APIGW_KEY && !credentail.APIGW_SERVICE_NAME) {
                this.router.navigate(['credentials-not-found']);
              } else if (this.$window().includes('credentials-not-found')) {
                this.router.navigate(['']);
              }
            }),
            catchError((_error: HttpErrorResponse) => {
              return this.router.navigate(['credentials-not-found']);
            }),
          );
        }),
      )
      .subscribe();
  }

  /**
   * Sets dynamic menu items based on the current ID token state.
   * If the token is valid, it generates the menu items; otherwise, it clears the menu.
   */
  private setDynamicMenuItems(): void {
    this.globalService
      .idToken()
      .pipe(takeUntil(this.destroy$))
      .subscribe((_token) => {
        if (!this.globalService.isTokenExpired()) {
          this.generateMenuItems();
        } else {
          this.menuItems = [];
        }
      });
  }

  /**
   * Generates menu items based on the default menu item configuration and user permissions.
   */
  async generateMenuItems(): Promise<void> {
    const menus: NavItemExtend[] = [];
    const menuItems = this.envConfig.getEnvConfig().MENU_ITEMS || [];
    for (const menu of menuItems) {
      const menuWithPermissions = await this.processMenuItem(menu);
      if (menuWithPermissions) {
        menus.push(menuWithPermissions);
      }
    }
    this.menuItems = menus;
  }

  /**
   * Filters and processes a list of navigation menu children based on user permissions.
   *
   * Iterates through the provided `children` array, checks if the user has the required permissions
   * for each child using `globalService.hasPermission`. If permitted, optionally sets the navigation
   * item as disabled for active clicks via `mfeLayoutService.setDisabledNavActiveClick` if
   * `disabledActiveClick` is true, and adds the child to the returned array.
   *
   * @param children - An array of `NavItemExtend` objects representing the menu children to process.
   * @returns A Promise that resolves to an array of permitted `NavItemExtend` objects.
   */
  private async processMenuChildren(
    children: NavItemExtend[],
  ): Promise<NavItemExtend[]> {
    const permittedChildren: NavItemExtend[] = [];

    for (const child of children) {
      if (await this.globalService.hasPermission(child.permissions)) {
        if (child.disabledActiveClick) {
          this.mfeLayoutService.setDisabledNavActiveClick(child.link!);
        }
        permittedChildren.push(child);
      }
    }

    return permittedChildren;
  }

  /**
   * Processes a navigation menu item by checking authentication and permissions.
   *
   * - Returns `null` if the user is not authenticated or lacks required permissions.
   * - If the menu item has children, recursively processes them and removes the menu item if no children are permitted.
   * - Returns the menu item with permitted children, or `null` if not permitted.
   *
   * @param menu - The navigation menu item to process.
   * @returns A promise that resolves to the permitted `NavItemExtend` or `null` if not permitted.
   */
  private async processMenuItem(
    menu: NavItemExtend,
  ): Promise<NavItemExtend | null> {
    if (!this.globalService.idToken().getValue()) {
      return null;
    } else if (this.globalService.idToken().getValue()) {
      return menu;
    }

    if (!(await this.globalService.hasPermission(menu.permissions))) {
      return null;
    }

    if (menu.children) {
      const permittedChildren = await this.processMenuChildren(menu.children);
      menu.children = permittedChildren;

      if (menu.children.length === 0) {
        return null;
      }
    }

    return menu;
  }

  /**
   * Determines if the component can render based on the current window URL
   * and the service credentials.
   * @returns {boolean} True if the component can render, false otherwise.
   */
  get canRender() {
    return (
      this.$window().includes('login') ??
      this.$window().includes('credentials-not-found') ??
      this.globalService.hasServiceCredential
    );
  }
}
