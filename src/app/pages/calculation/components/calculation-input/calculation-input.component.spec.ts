import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CalculationInputComponent } from './calculation-input.component';
import { ProcessInformationComponent } from './process-information/process-information.component';
import { PipingDataComponent } from './piping-data/piping-data.component';
import { PipesimComponent } from './pipesim/pipesim.component';
import { ElementRef } from '@angular/core';
import { AlertService } from '../../../../shared/services/alert.service';
import { CalculationContextService } from '../../CalculationContext.service';
import { APP_CONFIG, EnvironmentConfiguration } from '../../../../core/interfaces/environment-configuration';
import { LayoutStyle } from '../../../../core/models/mfe-models.model';
import { Environment } from '../../../../core/enums/environments.enum';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ThermowellComponent } from './thermowell/thermowell.component';
import { ErosionComponent } from './erosion/erosion.component';

describe('CalculationInputComponent', () => {
    let component: CalculationInputComponent;
    let fixture: ComponentFixture<CalculationInputComponent>;
    let alertServiceSpy: jasmine.SpyObj<AlertService>;
    let calculationContextServiceSpy: jasmine.SpyObj<CalculationContextService>;
    let router: jasmine.SpyObj<Router>;


    const mockLayoutStyle: LayoutStyle = {
        header: { /* mock header settings if required */ },
        navigation: { /* mock nav settings if required */ },
        footer: { /* mock footer settings if required */ }
    };
    const mockAppConfig: EnvironmentConfiguration = {
        APP_FRONTEND_URL: '',
        APP_TITLE: 'Test App',
        APP_VERSION: '1.0.0',
        BASE_URL_SERVICE: '',
        APIGW_BASE_URL: '',
        BASE_URL: '',
        DEBUG_MODE: false,
        LAYOUT_STYLE: mockLayoutStyle,
        MICROSOFT_TENANT: '',
        MSAL_CLIENT_ID: '',
        NODE_ENV: Environment.local,
        EP_LAYOUT_URL: '',
        SEQUENCE_FLOW:['1,2,3']
    };
    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const nzModalServiceMock = jasmine.createSpyObj('NzModalService', ['create', 'confirm']);

        const mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: (key: string) => null,
                },
                queryParamMap: {
                    get: (key: string) => null
                }
            },
            params: of({}),
            queryParams: of({})
        };
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['success', 'error']);
        calculationContextServiceSpy = jasmine.createSpyObj('CalculationContextService', ['getSelectPosition', 'getProcessForm']);

        await TestBed.configureTestingModule({
            imports: [CalculationInputComponent, HttpClientTestingModule],
            providers: [
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: CalculationContextService, useValue: calculationContextServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: APP_CONFIG, useValue: mockAppConfig },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: NzModalService, useValue: nzModalServiceMock }

            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CalculationInputComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        const pipingSpyEl = jasmine.createSpyObj('HTMLElement', ['scrollIntoView']);
        const processSpyEl = jasmine.createSpyObj('HTMLElement', ['scrollIntoView']);

        component.pipingDataRef = { nativeElement: pipingSpyEl } as ElementRef;
        component.processInfoRef = { nativeElement: processSpyEl } as ElementRef;
    });

    afterEach(() => {
        if (fixture) {
          fixture.destroy();
        }
      });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('onScrollToPipingData should call scrollIntoView on pipingDataRef', () => {
        component.onScrollToPipingData();

        expect(component.pipingDataRef.nativeElement.scrollIntoView)
            .toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('onScrollToProcessInfo should call scrollIntoView on processInfoRef', () => {
        component.onScrollToProcessInfo();

        expect(component.processInfoRef.nativeElement.scrollIntoView)
            .toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    describe('onSaveDraft', () => {
        let mockProcessComponent: jasmine.SpyObj<ProcessInformationComponent>;
        let mockPipingComponent: jasmine.SpyObj<PipingDataComponent>;
        let mockThermowellComponent: jasmine.SpyObj<ThermowellComponent>;
        let mockErosionComponent: jasmine.SpyObj<ErosionComponent>;
        let mockPipesimComponent: jasmine.SpyObj<PipesimComponent>;

        beforeEach(() => {
            mockProcessComponent = jasmine.createSpyObj('ProcessInformationComponent', ['saveDraft']);
            mockPipingComponent = jasmine.createSpyObj('PipingDataComponent', ['saveDraft']);
            mockThermowellComponent = jasmine.createSpyObj('ThermowellComponent', ['saveDraft']);
            mockErosionComponent = jasmine.createSpyObj('ErosionComponent', ['saveDraft']);
            mockPipesimComponent = jasmine.createSpyObj('PipesimComponent', ['saveDraft']);

            component.processComponent = mockProcessComponent;
            component.pipingComponent = mockPipingComponent;
            component.thermowellComponent = mockThermowellComponent;
            component.erosionComponent = mockErosionComponent;
            component.pipesimComponent = mockPipesimComponent;
        });

        it('should call error alert if saveDraft fails', async () => {
            component.sequenceFlow = '1,2,3,4';

            mockProcessComponent.saveDraft.and.returnValue(Promise.reject('Error in process'));
            mockPipingComponent.saveDraft.and.returnValue(Promise.resolve());
            mockThermowellComponent.saveDraft.and.returnValue(Promise.resolve());
            mockErosionComponent.saveDraft.and.returnValue(Promise.resolve());
            mockPipesimComponent.saveDraft.and.returnValue(Promise.resolve());

            await component.onSaveDraft();

            expect(alertServiceSpy.error).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.any(String),
                true,
                3000
            );
        });

        it('should call saveDraft on all components and show success alert for full sequence',fakeAsync(async () => {
            component.sequenceFlow = '1,2,3,4';

            mockProcessComponent.saveDraft.and.returnValue(Promise.resolve());
            mockPipingComponent.saveDraft.and.returnValue(Promise.resolve());
            mockThermowellComponent.saveDraft.and.returnValue(Promise.resolve());
            mockErosionComponent.saveDraft.and.returnValue(Promise.resolve());
            mockPipesimComponent.saveDraft.and.returnValue(Promise.resolve());

            await component.onSaveDraft();
            tick();
            
            expect(mockProcessComponent.saveDraft).toHaveBeenCalled();
            expect(mockPipingComponent.saveDraft).toHaveBeenCalled();
            expect(mockThermowellComponent.saveDraft).toHaveBeenCalled();
            expect(mockErosionComponent.saveDraft).toHaveBeenCalled();
            expect(mockPipesimComponent.saveDraft).toHaveBeenCalled();

            expect(alertServiceSpy.success).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.any(String),
                true,
                3000
            );
          }));

        it('should call saveDraft on process and piping components only when sequenceFlow is not included in others', async () => {
            component.sequenceFlow = '1,2';

            mockProcessComponent.saveDraft.and.returnValue(Promise.resolve());
            mockPipingComponent.saveDraft.and.returnValue(Promise.resolve());

            await component.onSaveDraft();

            expect(mockProcessComponent.saveDraft).toHaveBeenCalled();
            expect(mockPipingComponent.saveDraft).toHaveBeenCalled();

            expect(mockThermowellComponent.saveDraft).not.toHaveBeenCalled();
            expect(mockErosionComponent.saveDraft).not.toHaveBeenCalled();
            expect(mockPipesimComponent.saveDraft).not.toHaveBeenCalled();

            expect(alertServiceSpy.success).toHaveBeenCalled();
        });

    });

    describe('onBackStep', () => {
        it('should emit backStep', async () => {
            spyOn(component.backStep, 'emit');
            await component.onBackStep();
            expect(component.backStep.emit).toHaveBeenCalled();
        });
    });

    describe('onScrollToPipingData', () => {
        it('should call scrollIntoView on pipingDataRef', () => {
            const scrollSpy = jasmine.createSpy('scrollIntoView');
            component.pipingDataRef = new ElementRef({ scrollIntoView: scrollSpy });

            component.onScrollToPipingData();

            expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
        });
    });
});