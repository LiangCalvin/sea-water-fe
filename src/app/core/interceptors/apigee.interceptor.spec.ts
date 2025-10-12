import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EnvironmentConfigurationService } from '../../services/environment-configuration.service';
import { GlobalService } from '../../services/global.service';
import { Environment } from '../enums/environments.enum';
import { ApigeeInterceptor } from './apigee.interceptor';

describe('ApigeeInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let envConfigService: jasmine.SpyObj<EnvironmentConfigurationService>;
  let globalService: jasmine.SpyObj<GlobalService>;

  beforeEach(() => {
    envConfigService = jasmine.createSpyObj(
      'EnvironmentConfigurationService',
      ['getEnvConfig'],
      {},
    );
    envConfigService.getEnvConfig.and.returnValue({
      APIGW_KEY: 'mock-api-key',
      APIGW_SERVICE_NAME: 'mock-service-name',
      BASE_URL_SERVICE: 'https://mockservice.com/api',
      APIGW_BASE_URL: 'https://mockservice.com/api',
      BASE_URL: 'https://mockservice.com/api',
      APP_VERSION: '1.0.0',
      APP_TITLE: 'Test App',
      APP_FRONTEND_URL: 'http://localhost:4200',
      DEBUG_MODE: true,
      LAYOUT_STYLE: {},
      MICROSOFT_TENANT: 'test-tenant',
      MSAL_CLIENT_ID: 'test-client-id',
      NODE_ENV: Environment.dev,
      EP_LAYOUT_URL: 'http://localhost:3000',
      SEQUENCE_FLOW:['1,2,3']
    });

    globalService = jasmine.createSpyObj('GlobalService', ['getToken'], {});
    globalService.getToken.and.returnValue(of('mock-token'));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: EnvironmentConfigurationService,
          useValue: envConfigService,
        },
        { provide: GlobalService, useValue: globalService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApigeeInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS).find(
      (interceptor) => interceptor instanceof ApigeeInterceptor,
    );
    expect(interceptor).toBeTruthy();
  });

  it('should add headers to non-Microsoft requests', () => {
    httpClient.get('https://otherurl.com/api/data').subscribe();

    const httpRequest = httpMock.expectOne('https://otherurl.com/api/data');

    expect(httpRequest.request.headers.has('x-apikey'))
      .withContext('API key header should be present for non-Microsoft requests')
      .toBe(true);
    expect(httpRequest.request.headers.get('x-apikey'))
      .withContext('API key header value mismatch')
      .toBe('mock-api-key');
    expect(httpRequest.request.headers.has('x-service-name'))
      .withContext('Service name header should be present for non-Microsoft requests')
      .toBe(true);
    expect(httpRequest.request.headers.get('x-service-name'))
      .withContext('Service name header value mismatch')
      .toBe('mock-service-name');
    expect(httpRequest.request.headers.has('authorization'))
      .withContext('Authorization header should be present for non-Microsoft requests')
      .toBe(true);
    expect(httpRequest.request.headers.get('authorization'))
      .withContext('Authorization header value mismatch')
      .toBe('Bearer mock-token');
  });

  it('should not add headers to Microsoft Graph API requests', () => {
    httpClient.get('https://graph.microsoft.com/v1.0/me').subscribe();

    const httpRequest = httpMock.expectOne(
      'https://graph.microsoft.com/v1.0/me',
    );

    expect(httpRequest.request.headers.has('x-apikey'))
      .withContext('API key header should not be present')
      .toBe(false);
    expect(httpRequest.request.headers.has('x-service-name'))
      .withContext('Service name header should not be present')
      .toBe(false);
    expect(httpRequest.request.headers.has('authorization'))
      .withContext('Authorization header should not be present')
      .toBe(false);
  });

  it('should add headers to service API requests', () => {
    httpClient.get('https://mockservice.com/api/test').subscribe();

    const httpRequest = httpMock.expectOne('https://mockservice.com/api/test');

    expect(httpRequest.request.headers.has('x-apikey'))
      .withContext('API key header missing')
      .toBe(true);
    expect(httpRequest.request.headers.get('x-apikey'))
      .withContext('API key header value mismatch')
      .toBe('mock-api-key');
    expect(httpRequest.request.headers.has('x-service-name'))
      .withContext('Service name header missing')
      .toBe(true);
    expect(httpRequest.request.headers.get('x-service-name'))
      .withContext('Service name header value mismatch')
      .toBe('mock-service-name');
    expect(httpRequest.request.headers.has('authorization'))
      .withContext('Authorization header missing')
      .toBe(true);
    expect(httpRequest.request.headers.get('authorization'))
      .withContext('Authorization header value mismatch')
      .toBe('Bearer mock-token');
  });
});
