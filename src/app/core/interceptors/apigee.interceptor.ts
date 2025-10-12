import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  Observable,
  switchMap,
  take,
  throwError,
  timer,
} from 'rxjs';
import { GlobalService } from '../../services/global.service';
import { EnvironmentConfigurationService } from '../../services/environment-configuration.service';

export const RETRY_ATTEMPTED = new HttpContextToken(() => false);

@Injectable()
export class ApigeeInterceptor implements HttpInterceptor {
  private readonly globalService = inject(GlobalService);
  private readonly envConfig = inject(EnvironmentConfigurationService);

  private readonly API_KEY_HEADER = 'x-apikey';
  private readonly API_SERVICE_HEADER = 'x-service-name';
  private readonly AUTH_HEADER = 'authorization';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const apiKey = this.envConfig.getEnvConfig().APIGW_KEY;
    const serviceName = this.envConfig.getEnvConfig().APIGW_SERVICE_NAME;

    // if (this.isMicrosoftRequest(req.url)) {
    //   return next.handle(req);
    // }
    // ⚡ SHORT-CIRCUIT FOR LOCALHOST
    if (this.globalService.isLocalhost() || this.isMicrosoftRequest(req.url)) {
      return next.handle(req);
    }
    const initialRequest = req.clone();

    return this.globalService.getToken().pipe(
      take(1),
      switchMap((token: string) => {
        return next
          .handle(
            initialRequest.clone({
              headers: initialRequest.headers
                .set(this.API_KEY_HEADER, apiKey ?? '')
                .set(this.API_SERVICE_HEADER, serviceName ?? '')
                .set(this.AUTH_HEADER, `Bearer ${token}`),
            }),
          )
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error(`Error in request to ${req.url}:`, error);
              if (error.status === 401 || error.status === 0) {
                if (this.globalService.isTokenExpired()) {
                  console.warn('Token expired, requesting new token...');
                  this.globalService.onRequestNewRefreshToken();
                }

                return timer(1000).pipe(
                  switchMap(() => this.globalService.getToken()),
                  switchMap((newToken: string) => {
                    console.log(
                      `Retrying request to ${req.url} with new token: ${newToken}`,
                    );
                    return next.handle(
                      req.clone({
                        context: req.context.set(RETRY_ATTEMPTED, true),
                        headers: req.headers
                          .set(this.API_KEY_HEADER, apiKey ?? '')
                          .set(this.API_SERVICE_HEADER, serviceName ?? '')
                          .set(this.AUTH_HEADER, `Bearer ${newToken}`),
                      }),
                    );
                  }),
                  catchError((retryError: HttpErrorResponse) => {
                    // Clean up the retry tracking for this request
                    console.log(
                      `Retry failed for request to ${req.url}:`,
                      retryError,
                    );
                    return throwError(() => retryError);
                  }),
                  switchMap((response: HttpEvent<unknown>) => {
                    console.log(
                      `Request to ${req.url} retried successfully.`,
                      response,
                    );

                    return [response];
                  }),
                );
              }

              return throwError(() => error);
            }),
          );
      }),
    );
  }

  private isMicrosoftRequest(url: string): boolean {
    return url.includes(this.GRAPH_ENDPOINT);
  }
}
