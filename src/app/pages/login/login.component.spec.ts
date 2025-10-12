import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentConfigurationService } from '../../services/environment-configuration.service';
import { Environment } from '../../core/enums/environments.enum';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockConfigService: jasmine.SpyObj<EnvironmentConfigurationService>;

    beforeEach(async () => {
        mockConfigService = jasmine.createSpyObj(
            'EnvironmentConfigurationService',
            ['getEnvConfig', 'getBaseUrl', 'getSequenceFlow'],
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
            imports: [LoginComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: EnvironmentConfigurationService,
                    useValue: mockConfigService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
