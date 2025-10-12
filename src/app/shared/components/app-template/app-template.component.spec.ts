import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTemplateComponent } from './app-template.component';
import { Environment } from '../../../core/enums/environments.enum';
import { EnvironmentConfigurationService } from '../../../services/environment-configuration.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AppTemplateComponent', () => {
    let component: AppTemplateComponent;
    let fixture: ComponentFixture<AppTemplateComponent>;
    let mockConfigService: jasmine.SpyObj<EnvironmentConfigurationService>;

    beforeEach(async () => {
        mockConfigService = jasmine.createSpyObj(
            'EnvironmentConfigurationService',
            ['getEnvConfig', 'getBaseUrl'],
        );
        mockConfigService.getBaseUrl.and.returnValue('https://example.com');
        mockConfigService.getEnvConfig.and.returnValue({
            BASE_URL: 'https://example.com',
            APIGW_BASE_URL: 'https://api.example.com',
            NODE_ENV: Environment.local,
            APIGW_SERVICE_NAME: '',
            MSAL_CLIENT_ID: '',
            MICROSOFT_TENANT: '',
            APP_FRONTEND_URL: '',
            APP_TITLE: '',
            APP_VERSION: '',
            BASE_URL_SERVICE: '',
            DEBUG_MODE: false,
            LAYOUT_STYLE: {},
            EP_LAYOUT_URL: '',
            SEQUENCE_FLOW:['1,2,3']
        });

        await TestBed.configureTestingModule({
            imports: [AppTemplateComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: EnvironmentConfigurationService,
                    useValue: mockConfigService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
